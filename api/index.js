// Vercel entry point. vercel.json rewrites every /api/* request here, and the
// same Express app that runs locally handles it with its original URL.
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

module.exports = require('../server/app');
