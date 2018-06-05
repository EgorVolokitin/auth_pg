const
  auth = require('./lib/authLib'),
  bll = require('./lib/bll'),
  models = require('./models/models');

module.exports = exports = {
  /**
   * Функция входа в систему
   * @param {string} salt Соль
   */
  login: function(req, res, salt) {
    // Данные со страницы
    let
      password = req.body.password, // Пароль юзера
      email = req.body.email, // Email юзера
      remember = req.body.remember; // Запомнить логин и пароль

    // Создадим хеш с солью из нашего пароля
    bll.createHashString(password, salt)
    .then(function (hash) {
      //Затем произведем аутентификацию
      return auth.login(res, email, hash, remember);
    })
    .then(ck => {
      // Если вернулось значение - все ок.
      if(ck) {
        return true;
      }
      // Иначе - выдадим false. Регистрация не удалась
      return false;
    })
    .catch(function(e) {
      // В случае ошибки - вернем ее
      return new Error(e);
    });
  },

  /**
   * Функция логаута. Просто удаляем аутентификационную куку
   */
  logout: function(req, res) {
    res.clearCookie('auth');
    // Затем сделаем редирект для обновления кук.
    res.redirect('/');
  },

  /**
   * Миддл проверки на аутентификацию пользователя
   */
  need: (req, res, next) => {
    //Проверяем на аутентификацию
    auth.isAuthenticated(req, res)
    .then(a => {
      // Если все ок - выполним следующую функцию.
      if(a === true) {
        return next();
      }
      // Иначе - прекращаем выполнение
      return false;
    });
  },

  /**
   * Функция регистрации пользователя
   */
  register: function(req, res, salt) {
    const password = req.body.password,
      email = req.body.email;
    let hash;

    // Создадим хеш пароля
    bll.createHashString(password, salt)
    .then(h => {
      // Затем присвоим полученный хеш нашей уже готовой под него переменной
      hash = h;
      // Проведем регистрацию и вернем значение.
      return models.register(email, hash);
    })
    .then(data => {
      if(data === null) {
        return true;
      }
    })
    .catch(function (e) {
      // В случае ошибки - вернем ее.
      return new Error(e);
    });
  }
};
