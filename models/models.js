'use strict';
const db = require('../modules/pg_db');

module.exports = exports = {

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
    let query = `
      SELECT u.*, up.password 
      FROM users u
      LEFT JOIN users_passwords up ON u.email = up.email
      WHERE LOWER(u.email) = LOWER($1);`;

    return db.execute(query, [email]);
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
   * Функция регистрации пользователя
   * @param {string} email Мыло пользователя
   * @param {string} password Хеш пароля пользователя
   */
  register: function(email, password) {
    let query = `
        INSERT INTO users (email)
        VALUES ($1)
        RETURNING *;`,
      // экземпляр пользователя, который будет зарегистрирован
      newEntry = {};
    db.execute(query, [email])
    .then(u => {
      newEntry = u.rows[0];
      // после создания пользователя необходимо сохранить его пароль в отдельной таблице
      query = 'INSERT INTO users_passwords (email, password) VALUES ($1, $2) RETURNING *;';
      return db.execute(query, [email, password]);
    })
    .then(p => {
      newEntry.password = p.rows[0].password;
      // возвращаем объект с данными о пользователе
      return newEntry;
    });
  },

};
