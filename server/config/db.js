const config = require('./config');
const mongoose = require('mongoose');

module.exports = () => {
  return mongoose.connect(config.dbURL, {
    serverSelectionTimeoutMS: 10000,
  });
};

module.exports.isReady = () => mongoose.connection.readyState === 1;
