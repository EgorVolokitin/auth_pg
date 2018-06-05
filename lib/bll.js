/**
 * Модуль вспомогательных функций
 */
'use strict';

const crypto = require('crypto');

/**
 * Функция создания хеша
 * @param {string} input Значение для хеширования
 * @param {string} salt Соль
 */
exports.createHashString = function(input, salt) {
  return new Promise((resolve, reject) => {
    let interations = 50000, // Количество итераций
      keylen = 128; // Длина ключа

    // Создаем sha512-хеш с помощью crypto
    crypto.pbkdf2(input, salt, interations, keylen, 'sha512', (err, key) => {
      if(err) {
        // В случае ошибки возвращаем reject с текстом ошибки
        return reject(err);
      }
      // Если все ок - вернем строку в формате hex
      return resolve(key.toString('hex'));
    });
  });
};
