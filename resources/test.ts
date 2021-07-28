/*= @interface */
interface CustomObj {
    prop: string;
    prop2: number;
    prop3: {
        prop: string;
    },
    prop1;
}

/*=
* @schema MyObject {
*   id {#number} - айди обьекта;
*   test {
*       test2 {#number | #string} - тестовый обьект для парсинга;
*       id {#number}
*   }
* } - обьект тестовый
*/

/*=
* @name Тестовый роут
* @desc Описание роута
*
* @path /path/to/{route}?={id}
* @type GET
*
* @param route - Название какое-то
* @query id - ID какой-то
* @permissions TEST_1, TEST_2
*
* @header Authorization {#token} - Ключ авторизации
*
* @body {
*   id {#number} - айди обьекта;
*   test {
*       test2 {#number | #string} - тестовый обьект для парсинга;
*       id {#number}
*   }
* }
*
* @error 10013 { #Error } - Файлы сервера не найдены
* @success 20001 {
*    files { #File[] } - Тестовое описание
* } - Список файлов выдан
*/
