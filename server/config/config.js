const { env } = require('./env');

const config = {
    development: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB_URL || 'mongodb://127.0.0.1:27017/Car-Manager',
        origin: ['http://localhost:5555', 'http://localhost:4200', 'http://localhost:5173']
    },
    production: {
        port: process.env.PORT || 3000,
        // The Vercel MongoDB Atlas integration sets DB_MONGODB_URI (prefix "DB").
        dbURL: process.env.DB_URL || process.env.DB_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URL,
        origin: (process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean)
    }
};

const selectedConfig = config[env];

if (env === 'production' && !selectedConfig.dbURL) {
    throw new Error('DB_MONGODB_URI (or DB_URL) must be configured in production');
}

module.exports = selectedConfig;
