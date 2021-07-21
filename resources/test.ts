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
*   id {#number} - айди обьекта,
*   test {
*       test2 {#number | #string} - тестовый обьект для парсинга,
*       id {#number}
*   }
* } - обьект тестовый
*/

/*=
* @name Тестовый роут
* @body example_obj {#MyObject} - тестовый обьект
*/
