'use strict';
const db = require('../modules/pg_db');

module.exports = exports = {

  /**
   * Функция создания юзера
   * @param {object} user Объект данных юзера. Должен содеражать как минимум мыло, имя и пароль.
   */
  create: function(user) {
    // Составим запрос.
    let pars,
      query = `
      INSERT INTO users (email, name)
      VALUES ($1, $2)
      RETURNING *;`,
      newEntry = {};
    pars = [
      user.email,
      user.name
    ];
    // Отправим запрос и вернем значение
    return db.execute(query, pars)
    .then(u => {
      // Получим данные из бд.
      newEntry = u.rows[0];
      newEntry.password = user.password;

      // Еще один запрос. Но уже на внос пароля в users_passwords
      query = 'INSERT INTO users_passwords (email, password) VALUES ($1, $2);';
      return db.execute(query, [user.email, user.password]);
    })
    .then(() => newEntry);
  },

  // Объект с полями из бд
  fields: {
    deleted:  'deleted',
    email:    'email',
    name:     'name',
    password: 'password',
    patronim: 'patronim',
    phone:    'phone',
    sex:      'sex',
    surname:  'surname',
  },

  /**
   * Получаем инфу о пользователе по его мылу
   */
  getByEmail: function(email) {
    return new Promise((resolve) => {
      // Составляем и выполняем запрос.
      let query = `
        SELECT u.*, up.password 
        FROM users u
        LEFT JOIN users_passwords up ON u.email = up.email
        WHERE LOWER(u.email) = LOWER($1);`;

      return resolve(db.execute(query, [email]));
    });
  },

  /**
   * Получаем инфу о пользователе по его id.
   */
  getById: function(id) {
    // Составляем и выполняем запрос.
    let query = `
      SELECT u.*, up.password
      FROM users u
      LEFT JOIN users_passwords up ON u.email = up.email
      WHERE u.id = $1;`;

    return db.execute(query, [id]);
  },

  /**
   * Проверка мыла на уникальность
   */
  isEmailUniq: function(email) {
    let query = `
      SELECT id, deleted
      FROM users
      WHERE LOWER(email) = LOWER($1);`;

    return db.execute(query, [email]);
  },

  /**
   * Функция регистрации пользователя
   * @param {string} email Мыло пользователя
   * @param {string} password Хеш пароля пользователя
   */
  register: function(email, password) {
    // Составляем запрос
    let query = `
        INSERT INTO users (email)
        VALUES ($1)
        RETURNING *;`,
      newEntry = {};
    // Выполняем его
    db.execute(query, [email])
    .then(() => {
      // Затем ничего не принимая делаем следующий запрос.
      query = 'INSERT INTO users_passwords (email, password) VALUES ($1, $2);';
      // И так же его выполняем
      db.execute(query, [email, password]);
    })
    .then(() => newEntry);
  },

};
