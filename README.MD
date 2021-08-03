# API Docs parser

![Image alt](https://media.discordapp.net/attachments/548971947405475851/872160073454063636/unknown.png)

<br/>

> #### Please note that the documentation has not yet been fully translated

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

> ### [Link to Discord support server](https://discord.gg/cg82mjh)