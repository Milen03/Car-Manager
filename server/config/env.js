// Which configuration to use. The Docker image sets NODE_ENV=production, so
// Railway runs in production; `npm start` locally runs in development.
const env = process.env.NODE_ENV || 'development';

module.exports = {
    env,
    isProduction: env === 'production',
};
