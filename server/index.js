global.__basedir = __dirname;
const app = require('./app');
const config = require('./config/config');

const server = app.listen(config.port, '0.0.0.0', () => console.log(`Listening on port ${config.port}!`));

const shutdown = async () => {
  server.close();
  process.exit(0);
};

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);
