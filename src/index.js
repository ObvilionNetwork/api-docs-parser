const { readdir, readFile, lstat, writeFile } = require('fs/promises');
const { join } = require('path');
const { resources, output, docs_separator, api_prefix, extensions, blacklist } = require('../config.json');

const schemas = [];
const docs = [];

async function run() {
   const run_time = Date.now();
   const all_files = await get_all_files(resources);

   console.log(`| All files were read for ${Date.now() - run_time} ms. Count: ${all_files.length}`);
   console.log(``);

   for (const fi of all_files) {
      const ext = fi.split('.');
      if (extensions.indexOf(ext[ext.length - 1]) === -1) {
         continue;
      }

      let r = false;
      for (const b of blacklist) {
         if (join(resources, b) === fi) {
            r = true;
            break;
         }
      }
      if (r) continue;

      console.log(`Starting parsing file ${fi}`);

      const data = await readFile(fi, 'utf8');
      const lines = data.split('\n');

      /* Получаем все блоки доков из файла */
      const codes = [];
      let code = '';
      let left = true;
      let start_line;
      for (let ln = 0; lines.length > ln; ln++) {
         const line = lines[ln];

         if (!left) {
            const sch_right = line.split('*/');
            if (sch_right.length === 1) {
               code += line + '\n';
               continue;
            }

            code += sch_right[0];
            codes.push({ code: code.trim(), start_line: start_line + 1, end_line: ln + 1 });
            left = true;
            code = '';
         }

         if (left) {
            const sch_left = line.split(`/*${docs_separator}`);
            if (sch_left.length === 1) {
               continue;
            }

            start_line = ln;
            const end = sch_left[1].split('*/');
            left = end.length !== 1;
            if (!left) {
               code += sch_left[1];
            } else {
               code += end[0];
               codes.push({ code: code.trim(), start_line: start_line + 1, end_line: ln + 1 });
               code = '';
            }
         }
      }

      for (const code of codes) {
         let content = code.code;
         const nns = content.split('\n')

         content = nns.map(v => {
            return v.startsWith('*') ? v.replace('*', '').trim() : v.trim();
         }).join('\n');

         const args = content.split('@');
         args.splice(0, 1);

         const result = []; //
         for (const line of args) {
            const start_time = Date.now();

            const full_line = line.split('\n').join(' ').trim();
            let line_args = full_line.split(' ');

            console.debug(`+--> Обработка строки: "@${full_line}"`)

            /* TYPE */
            const type = line_args[0];
            line_args.splice(0, 1);

            /* NAME AND DOC TYPE */
            let name = null;
            let description = null;
            let doc_type = null
            for (const arg of line_args) {
               if (arg.startsWith('{')) {
                  name = line_args.splice(0, line_args.indexOf(arg)).join(' ');
                  const line = line_args.join(' '); // { content here... } - description
                  const temp = line_args.join(' ').split('}');

                  if (temp[temp.length - 1].startsWith(' - ')) {
                     description = temp[temp.length - 1].replace(' - ', '');
                  }

                  doc_type = line.replace(temp[temp.length - 1], '')

                  break;
               }
            }

            /* DESCRIPTION */
            if (name == null) {
               name = line_args.join(' ');

               let temp = name.split(' - ');
               if (name.startsWith('- ')) {
                  temp = name.split('- ')
               }

               name = temp[0] === '' ? null : temp[0];
               description = temp.length >= 2 ? temp[1] : null;
            }

            let type_arr = null;
            try {
                type_arr = doc_type == null ? null : await parse_obj(doc_type);
            } catch (e) {
               console.error(`| Error on parsing file ${fi}:${id + 1} ${e.message}`)
            }

            const res = {
               arg: type, name, description,
               type: type_arr
            };

            if (type) {
               console.debug(`| TYPE: ${type}`)
            } else delete res.arg;

            if (name) {
               console.debug(`| NAME: ${name}`)
            } else delete res.name

            if (description) {
               console.debug(`| DESCRIPTION: ${description}`)
            } else delete res.description

            if (doc_type) {
               console.debug(`| DOC TYPE: ${type_arr}`)
            } else delete res.type

            console.debug(`+--< Завершено за ${Date.now() - start_time} мс.`)
            console.log(``)

            //console.debug(JSON.stringify(res, 2, 2))

            result.push(res);
         }

         const info = {
            name: null,
            description: null,
            path: {
               content: null,
               params: [],
               query: []
            },
            type: null,
            headers: [],
            body: [],
            result: {
               error: [],
               success: []
            },
            permissions: []
         }

         for (const el of result) {
            if (el.arg === 'interface') {
               const lines_copy = lines;
               lines_copy.splice(0, code.end_line);
               let ln = lines_copy.join(' ').trim();

               if (ln.startsWith(' interface ')) {
                  console.log(`| Error on parsing file ${fi}:${code.end_line + 1} - 'interface' not found!`)
                  break;
               }

               ln = ln.replace('interface ', '');

               const temp_4 = ln.split('{');
               if (temp_4.length === 1) {
                  console.log(`| Error on parsing file ${fi}:${code.end_line + 1} - Incorrect interface code block! '{' Not found`)
                  break;
               }

               const name = temp_4[0].trim().split(' ');
               if (name.length !== 1) {
                  console.log(`| Error on parsing file ${fi}:${code.end_line + 1} - Incorrect interface code block! Invalid interface name`)
                  break;
               }

               temp_4.splice(0, 1);
               let symbols = temp_4.join('{').split(' ');
               while (true) {
                  const i = symbols.indexOf('');
                  if (i >= 0) {
                     symbols.splice(i, 1);
                  } else break;
               }

               symbols = symbols.join(' ').split('');

               const parce = () => {
                  let result = '';
                  let p = {
                     content: '',
                     rows: []
                  }

                  while (true) {
                     const n = symbols[0];
                     symbols.splice(0, 1);

                     if (n === '{') {
                        result += '{}';
                        p.rows.push(parce());
                        continue;
                     }

                     if (n === '}') {
                        p.content = result.trim();
                        break;
                     }

                     result += n;

                     if (symbols.length === 0) {
                        console.log(`| Error on parsing file ${fi}:${code.end_line + 1} - Not found \'}\' in comment block.`)
                        break;
                     }
                  }

                  return p;
               }

               const res = parce();

               const get_json = (p_comp) => {
                  // Разделяем переменные через ';'
                  const rk_all = p_comp.content.split(';');
                  const rl_all = [];
                  for (const rk of rk_all) {
                     rk.split(',').forEach(e => rl_all.push(e))
                  }

                  let result = [];

                  let i = 0;
                  for (const ob of rl_all) {
                     // Ищем ':' и забираем имя (слева)
                     const args = ob.split(':');
                     let name = args[0].trim();

                     if (name === '') continue;

                     const l_args = ob.split('{}');
                     let type = args[1] == null ? null : args[1].trim();

                     // Если '{}' были найдены, то
                     if (l_args.length > 1) {
                        const t_type = p_comp.rows[i];

                        // Если есть вложения
                        if (t_type.rows) {
                           // Получает JSON object
                           type = get_json(t_type);
                        } else {
                           // Получает строку с типом и убирает решетку
                           type = t_type.content;
                        }

                        i++;
                     }

                     const el = {
                        name, type
                     };

                     if (type == null) delete el.type;

                     result.push(el);
                  }

                  if (result.length === 1 && !result[0].description
                     && !result[0].name && result[0].type != null) {
                     result = result[0].type;
                  }

                  return result;
               }

               schemas.push({
                  name: name[0],
                  type: get_json(res),
                  from: 'interface',
                  file: fi,
                  line: code.end_line + 1
               });
            }

            else if (el.arg === 'schema') {
               el.from = 'schema';
               el.file = fi;
               el.line = code.start_line;
               delete el.arg;

               schemas.push(el);
            }

            else if (el.arg === 'name') {
               info.name = el.name;
            }

            else if (el.arg === 'desc') {
               info.description = el.name;
            }

            else if (el.arg === 'path') {
               if (el.name.startsWith('/')) {
                  info.path.content = api_prefix + el.name;
               } else {
                  info.path.content = api_prefix + '/' + el.name;
               }
            }

            else if (el.arg === 'param') {
               info.path.params.push({
                  name: el.name,
                  description: el.description,
                  type: el.type
               });
            }

            else if (el.arg === 'query') {
               info.path.query.push({
                  name: el.name,
                  description: el.description,
                  type: el.type
               });
            }

            else if (el.arg === 'type') {
               info.type = el.name;
            }

            else if (el.arg === 'body') {
               info.body = el.type;
            }

            else if (el.arg === 'permissions') {
               for (const tmp of el.name.split(',')) {
                  info.permissions.push(tmp.trim());
               }
            }

            else if (el.arg === 'error') {
               info.result.error.push({
                  code: el.name,
                  description: el.description,
                  type: el.type
               });
            }

            else if (el.arg === 'success') {
               info.result.success.push({
                  code: el.name,
                  description: el.description,
                  type: el.type
               });
            }

            else if (el.arg === 'header') {
               info.headers.push({
                  name: el.name,
                  description: el.description,
                  type: el.type
               });
            }
         }

         if (info.path.content != null)
         docs.push(info);

         result.splice(0);
      }

      console.log(`| Founded ${codes.length} documentation comment block`);
   }

   await writeFile(join(output, 'docs.json'), JSON.stringify(docs, 3, 3));
   await writeFile(join(output, 'schemas.json'), JSON.stringify(schemas, 3, 3));

   console.log(`| End of script. Parsed on ${Date.now() - run_time} ms.`);
}

async function parse_obj(str) {
   str = str.substr(1).substr(0, str.length - 1);
   str = str.trim();
   const l = str.split('');

   const parce = () => {
      let content2 = '';
      let p = {
         content: '',
         rows: []
      }

      while (true) {
         const n = l[0];
         l.splice(0, 1);

         if (n === '{') {
            content2 += '{}';
            p.rows.push(parce());
            continue;
         }

         if (n === '}') {
            p.content = content2.trim();
            break;
         }

         if (l.length === 0) {
            throw Error('Not found \'}\' in comment block.')
            break;
         }

         content2 += n;
      }

      if (p.rows.length === 0) delete p.rows;
      return p;
   }

   const rl = parce();
   const get_json = (p_comp) => {
      // Разделяем переменные через ','
      const rl_all = p_comp.content.split(',');
      let result = [];

      let i = 0;
      for (const ob of rl_all) {
         // Ищем '{}' и забираем имя (слева)
         const args = ob.split('{}');
         let name = args[0].trim();

         let description = null;
         // Ищем описание по первому ' - '
         let desc_arg = ob.split(' - ');
         if (desc_arg.length > 1) {
            desc_arg.splice(0, 1);
            description = desc_arg.join(' - ');
         }

         let type = null;
         // Если '{}' были найдены, то
         if (args.length > 1) {
            const t_type = p_comp.rows[i];

            // Если есть вложения
            if (t_type.rows) {
               // Получает JSON object
               type = get_json(t_type);
            } else {
               // Получает строку с типом и убирает решетку
               type = t_type.content.split('#').join('');
            }

            i++;
         } else {
            // Если '{}' не найдены, то вырезаем описание из имени
            name = name.split(' - ')[0];
            // Если в имени указан элемент с #, то это тип
            if (name.startsWith('#')) {
               type = name.replace('#', '');
               name = null;
            }
         }

         const el = {
            name, description, type
         };

         if (!name) delete el.name;
         if (!description) delete el.description;
         if (!type) delete el.type;
         result.push(el);
      }

      if (result.length === 1 && !result[0].description
         && !result[0].name && result[0].type != null) {
         result = result[0].type;
      }

      return result;
   }

   return get_json(rl);
}

async function get_all_files(dir) {
   const result = [];
   const files = await readdir(dir);

   for (const f of files) {
      const file_path = join(dir, f);
      const info = await lstat(file_path);
      if (info.isFile()) {
         result.push(file_path);
         continue;
      }

      for (const res of await get_all_files(file_path)) {
         result.push(res);
      }
   }

   return result;
}

run();
