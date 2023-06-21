'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL } = require('./config');

mongoose.set('debug', true);

async function dbConnect(url = DATABASE_URL) {
  console.log('connecting');
  return mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch(err => {
      console.error('Mongoose failed to connect');
      console.error(err);
    });
}

function dbDisconnect() {
  return mongoose.disconnect();
}

function dbGet() {
  return mongoose;
}

module.exports = {
  dbConnect,
  dbDisconnect,
  dbGet
};
