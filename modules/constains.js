'use strict';

module.exports = {
  db: {
    database: process.env.MENSHIH_DB_DB,
    host: process.env.MENSHIH_DB_ADDR,
    password: process.env.MENSHIH_DB_PWD,
    user: process.env.MENSHIH_DB_USER
  }
};
