const config = require('./config');
const mongoose = require('mongoose');

let connecting = null;

// Connection strings from Railway and Atlas usually have no database in the path,
// which would make Mongo use "test". Default to the same database name as local
// development so migrated data is found.
const defaultDbName = 'Car-Manager';
const hasDatabaseInPath = (url) => /^mongodb(?:\+srv)?:\/\/[^/]+\/[^?/]+/.test(url || '');

// Resolves once Mongoose is connected. Concurrent callers share one attempt, and a
// failed attempt is forgotten so the next request retries instead of leaving the
// instance stuck on 503 until it is restarted.
function connect() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!connecting) {
    connecting = mongoose.connect(config.dbURL, {
      serverSelectionTimeoutMS: 10000,
      ...(hasDatabaseInPath(config.dbURL) ? {} : { dbName: defaultDbName }),
    }).catch((error) => {
      connecting = null;
      throw error;
    });
  }

  return connecting;
}

module.exports = connect;
module.exports.isReady = () => mongoose.connection.readyState === 1;
