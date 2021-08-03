# API Docs parser

![Image alt](https://media.discordapp.net/attachments/548971947405475851/872160073454063636/unknown.png)

<br/>

> #### Please note that the documentation has not yet been fully translated

## Example code
```ts
/*= @group Group name - Group description */

/*= @interface */
interface File {
    path: string;
    size: number,
    isDir: boolean
}

/*=
* @schema CustomError {
*   code {#number};
*   message {#string}
* } - Schema error description
*/

/*=
* @name Route for test
* @desc Same route description
*
* @path /path/to/{route}?={id}
* @type POST
*
* @param route - Your description
* @query id {#number}
* @permissions TEST_1, TEST_2
*
* @header Authorization {#string} - Auth key
* @header Optional-Header? {#your_custom_type} - More headers
*
* @body {
*   id? {#number} - Optional json field;
*   test {
*       test2 {#number | #string} - Multiple values are supported;
*       id {#number}
*   }
* }
*
* @error 10013 { #CustomError } - Error code, type, and description
* @success 20001 {
*    files { #File[] } - Arrays
* } - Success code, type, and description
*/
```

## Syntax
- **OADP*** - its abbreviated **Obvilion API Docs Parser**
<br/>

**OADP** использует многострочный комментарий с определенным префиксом (по умолчанию `=`), его можно легко изменить в конфиге.
Кроме этого поддерживаются блоки с кодом как и со звездочками на каждой новой строке, так и без них.
```ts
/*= 
* @argument name {type} - description
*/
```
Строку в вышеуказанном коде мы можем разбить на четыре части:
1) `@argument`, он обязательно должен начинаться с символа `@`. Этот аргумент указывает, за что отвечает следующая строка кода. Не может содержать пробелов.
2) `name` необходим, для того чтобы указывать некоторый текст в наш блок кода. Обычно используется для указания названия обьекта.
3) `{type}` находится в фигурных скобках, и обозначает обьект или его тип. О типах мы поговорим ниже.
4) `- description` пишется после символа `-`, может содержать множество слов. Есть поддержка форматирования текста.
<br/>

```ts
/*= 
* @body {
*   id? {#number} - Optional json field;
*   test {
*       test2 {#number | #string} - Multiple values are supported;
*       id {#CustomSchema}
*   }
* }
*/
```
* Давайте теперь разберём создание обьектов. В данном случае мы указываем, что в `body` нужно использовать данный JSON обьект. Внутри фигурных скобок мы видим множество других переменных. 
* Знак вопроса `?` в конце названия переменной означает, что данная переменная не является обязательной и отутствие данного значения в вашем API не будет восприниматься как ошибка.
* Все **конечные типы должны записываться с знаком решетки** `#` перед названием типа. Имеется поддержка нескольких типов через разграничивающий символ `|`
* Далее идет описание, оно является опциональным, и его писать не обязательно.
* Обратите внимание, что все обьявленные значения должны заканчиваться разграничительным символом `;`, за исключением последнего значения в блоке фигурных скобок `{}`

## All the arguments and their description
| Argument | Description | Flags |
| :------- | :---------: | :---: |
| `@interface` | Вы можете преобразовать ваш interface, написанный на языке TypeScript в схему | - |
| `@schema` | Преобразует блок документации в схему                                    | `<name>` `<type>` `[description]` |
| `@group` | Создает группу запросов с указанным именем и описанием. Можно использовать несколько раз в одном файле. | `<name>` `[description]` |
| `@name` | Устанавливает название тестируемому запросу                                | `<name>` |
| `@desc` | Устанавливает описание тестируемому запросу                                | `<name>` |
| `@path` | Устанавливает путь URL к тестируемому запросу                              | `<name>` |
| `@param` | Устанавливает свойтва параметра в пути URL запроса                        | `<name>` `[type]` `[description]` |
| `@query` | Устанавливает свойтва query-парметра в пути URL запроса                   | `<name>` `[type]` `[description]` |
| `@type` | Устанавливает метод запроса (GET, POST, DELETE...)                         | `<name>` |
| `@body` | Устанавливает обьект в body запроса                                        | `<type>` |
| `@header` | Добавляет в запрос header                                                | `<name>` `[type]` `[description]` |
| `@permissions` | Устанавливает необходимые permissions для выполнения запроса        | `<name>` |
| `@error` | Указывает обьект, который возращается при ошибке выполнения запроса. Можно использовать несколько раз. | `<name>` `[type]` `[description]` |
| `@success` | Указывает обьект, который возращается при успешном выполнении запроса. Можно использовать несколько раз. | `<name>` `[type]` `[description]` |

<br/>

> ### [Link to Discord support server](https://discord.gg/cg82mjh)
