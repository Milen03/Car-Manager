// Which configuration to use. Read by every module that depends on it rather
// than set once in app.js, because Vercel's bundler hoists requires above the
// entrypoint's own code, so a value assigned there arrives too late. Vercel
// deployments are production unless NODE_ENV says otherwise.
const env = process.env.NODE_ENV || (process.env.VERCEL ? 'production' : 'development');

module.exports = {
    env,
    isProduction: env === 'production',
};
