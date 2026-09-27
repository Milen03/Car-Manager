const config = require('./config');
const mongoose = require('mongoose');

let connecting = null;

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
    }).catch((error) => {
      connecting = null;
      throw error;
    });
  }

  return connecting;
}

module.exports = connect;
module.exports.isReady = () => mongoose.connection.readyState === 1;
