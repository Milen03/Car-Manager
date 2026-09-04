global.__basedir = __dirname;
require('dotenv').config()
const dbConnector = require('./config/db');
// const mongoose = require('mongoose');
const apiRouter = require('./router');
const cors = require('cors');
// const config = require('./config/config');
const { errorHandler } = require('./utils');

dbConnector()
  .then(() => {
    const config = require('./config/config');

    const app = require('express')();
    require('./config/express')(app);

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || config.origin.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true
    }));

    app.use('/api', apiRouter);

    app.use(errorHandler);

    const server = app.listen(config.port, () => console.log(`Listening on port ${config.port}!`));

    const shutdown = async () => {
      server.close();
      process.exit(0);
    };

    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  })
  .catch(console.error);