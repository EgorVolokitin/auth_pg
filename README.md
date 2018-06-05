# auth_pg
Модуль аутентификации, легко встраиваемый в nodejs-проект.

> Внимание, этот модуль требует наличие определенной структуры таблиц на pgsql. В противном случае он может работать не правильно!

## Начало работы

> Предполагается что ваш проект построен на [Node.js](https://nodejs.or/en/downolad/).

```sh
$ npm install --save auth_pg
```
### Внимание:

> В PGSQL должна быть таблица users с email, id и другими данными пользователя и таблица users_passwords с email и password. Таблицы связаны по полю email. Это абсолютный минимум.

## Перед началом:

```bash
# Переходим в свой проект из консоли или терминала
cd ./my-project

# Устанавливаем модуль
npm i --save auth_pg

# Запускаем свой проект привычным для вас способом
```

## Документация

### Подключение в проекте

> Предполагается что модуль уже установлен у вас в проекте

```js
const auth = require('auth_pg');
```

### Login
Данная функция принимает на вход с сервера request, response и salt (соль для шифрования).
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

### Logout
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

### Need
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

### Register
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
