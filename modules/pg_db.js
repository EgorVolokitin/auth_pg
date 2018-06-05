'use strict';

const pg = require('pg'),
  consts = require('./constants');

// Создаем пул
let pgPool = new pg.Pool(consts.db);

// Обработка ошибок пула
pgPool.on('error', function (err) {
  console.error('DB :: IDLE CLIENT ERROR: ', err.message, err.stack);
});

module.exports = exports = {

  /**
   * Функция отправки SQL-запросов в бд
   * @param {string} text Текст SQL-запроса
   * @param {*} values Массив данных
   */
  execute: function(text, values) {
    return pgPool.query(text, values);
  },

  pool: pgPool,

};
