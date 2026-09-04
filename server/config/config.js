const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB_URL || 'mongodb://127.0.0.1:27017/Car-Manager',
        origin: ['http://localhost:5555', 'http://localhost:4200', 'http://localhost:5173']
    },
    production: {
        port: process.env.PORT || 3000,
        dbURL: process.env.DB_URL_CREDENTIALS || process.env.DB_URL,
        origin: (process.env.CLIENT_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean)
    }
};

const selectedConfig = config[env];

if (env === 'production' && (!selectedConfig.dbURL || selectedConfig.origin.length === 0)) {
    throw new Error('DB_URL and CLIENT_ORIGIN must be configured in production');
}

module.exports = selectedConfig;
