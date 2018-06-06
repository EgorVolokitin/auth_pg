# auth_pg
Модуль аутентификации, для nodejs-проекта на pgsql.

## Начало работы

### Стуктура БД


Для работы модуля необходимы 2 таблицы:

  1. Таблица `users` должна иметь поля:
      * email
      * id
  2. Таблица `users_passwords` должна иметь поля
      * email
      * password

  Таблицы должны быть связаны по `email`.
  
```sh
$ npm install --save auth_pg
```

## Документация

### Подключение в проекте

```js
const auth = require('auth_pg');
```

### setConfig
Функция принимает 4 параметра:
  * имя бд
  * адрес
  * пароль
  * имя пользователя

```js
/**
 * Конфигурация для коннекта к бд
 */
auth.setConfig('dbName', 'host', 'password', 'userName');
```

### login
Функция принимает на вход с сервера request, response и salt (соль для шифрования).
Выставляет аутентификационную куку с именем 'auth'.
Вернет 'true' если аутентификация прошла успешно. В противном случае возвращает ошибку.

```js
/**
 * Принимаем данные на логин и пренаправляем в модуль.
 * Здесь 'authtest' - соль для шифрования
 */
.post('/login', function(req, res) {
  auth.login(req, res, 'authtest');
});
```

### logout
Эта функция просто удаляет куку с именем 'auth'.

```js
/**
 * Удаляем аутентификационную куку.
 */
router
.post('/logout', function(req, res) {
  auth.logout(req, res);
});
```

### need
Миддл проверки пользователя на наличие аутентификационной куки.
Следующая функция выполнится только если аутентификация прошла успешно.

```js
/**
 * Миддл для проверки аутентифицированности пользователя.
 * Функция за 'auth.need' пройдет только если пользователь аутентифицирован.
 */
router
.post('/isauth', auth.need, function(req, res) {
  console.log('Some your function');
});
```

### register
Функция для регистрации пользователя. Принимает на вход reques, respone и salt (соль для шифрования).
Вернет 'true' если регистрация прошла успешно. Иначе вернет ошибку.

```js
/*
 *Функция регистрации пользователя. Здесь 'authtest' это соль. 
 */
router
.post('/register', function(req, res) {
  auth.register(req, res, 'authtest');
});
```
