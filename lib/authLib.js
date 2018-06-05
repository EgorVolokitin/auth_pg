'use strict';

const models = require('../models/models'),
  db = require('../modules/pg_db');

function generateExpDate(remember) {
  const LOCAL = 0, // Кука будет жить пока пользователь не перезапустит браузер
    TWENTY_FIVE_YEAR = 788400000; // 25 лет
  return new Date(Date.now() + (remember ? TWENTY_FIVE_YEAR : LOCAL));
}

let authLib = {
  /**
   * Функция проверки аутентификации юзера
   */
  isAuthenticated: (req, res) => {
    // Если отсутствует кука - вернем false
    if(!req.cookies.auth) {
      return Promise.resolve(false);
    }

    // Если с ней все ок - вернем true
    if(res.locals.auth
      && res.locals.auth.user
      && res.cookies.auth.pwdHash === res.locals.auth.user.password) {

      return Promise.resolve(true);
    }

    // Получим инфу о юзере по мылу
    return models.getByEmail(req.cookies.auth.email)
    .then(u => {
      let user = u.rows[0];
      // Если такого юзера нет или он удален - удалим его куку и вернем false
      if(!user || user.deleted) {
        res.clearCookie('auth');
        return false;
      }

      // Если кука есть, но пароль из нее не совпадает с паролем из бд - удалим куку и вернем false
      if(req.cookies.auth.pwdHash !== user.password) {
        res.clearCookie('auth');
        return false;
      }

      if(!res.locals.auth) {
        res.locals.auth = {};
      }
      res.locals.auth.user = user;

      // Если все ок - вернем true
      return true;
    })
    .catch(e => {
      // Обработаем ошибку, выведя ее в консоль и вернем false
      console.error(e);
      return false;
    });
  },

  /**
   * Функция логина
   * @param {string} email Email юзера
   * @param {string} password Хеш пароля пользователя
   * @param {Boolean} remember Будет ли кука жить 25 лет
   */
  login: function(res, email, password, remember) {
    return models.getByEmail(email)
    .then(u => {
      let user = u.rows[0],
        cookieConfig;

      // если юзера нет / удален / пароль не совпадает - вернем false.
      if(!user || user.deleted || password !== user.password) {
        return false;
      }

      // Наш конфиг для куки
      cookieConfig = {
        email: email,
        id: user.id,
        pwdHash: user.password,
        remember: Boolean(remember)
      };

      // Отправка куки
      res.cookie('auth', cookieConfig, {
        httpOnly: true,
        maxAge: generateExpDate(remember),
        secure: false
      });
      // Сделаем редирект для обновления и вернем true
      res.redirect('/');
      return true;
    });
  },

  needAdmin: function(req, res, next) {
    let redirectUrl = `/account/login?ru=${req.originalUrl}`;

    if(!req.cookies.auth) {
      return res.redirect(redirectUrl);
    }

    let query = `
    SELECT users_password.password, users.id, users.email
    FROM users_roles
    LEFT JOIN roles ON users.roles.role_id = roles.id
    LEFT JOIN users ON users_roles.user_id = users.id
    LEFT JOIN users_passwords ON users_passwords.email = users.email
    WHERE LOWER(users.email) = LOWER($1) AND roles.name = $2;`;

    db.execute(query, [res.cookies.auth.email, 'admin'])
    .then(u => {
      let user = u.rows[0];

      if(!user || user.deleted || req.cookies.auth.pwdHash !== user.password) {
        return res.redirect(redirectUrl);
      }

      return next();
    })
    .catch(e => next(e));
  },

};

module.exports = exports = authLib;
