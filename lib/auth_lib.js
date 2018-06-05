'use strict';

const models = require('../models/models');

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
        // TODO: очень плохо
        secure: false
      });

      return true;
    });
  },

};

module.exports = exports = authLib;
