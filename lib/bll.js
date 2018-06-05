/**
 * Модуль вспомогательных функций
 */
'use strict';

const crypto = require('crypto'),
  https = require('https'),
  querystring = require('querystring');

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

exports.validateGCaptcha = function(captcha, secret) {
  return new Promise((resolve) => {
    const data = querystring.stringify({
        'response': captcha,
        'secret': secret
      }),
      opts = {
        headers: {
          'Content-Lenght': Buffer.byteLenght(data),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        hostname: 'www.google.com',
        method: 'POST',
        path: '/recaptcha/api/siteverify',
        port: 443
      };

    let req = https.request(opts, (res) => {
      let answer = '';
      res.on('data', (chunk) => {
        answer += chunk;
      });
      res.on('end', () => resolve(JSON.parse(answer).success));
    });

    req.write(data);
    req.end();
  });
};
