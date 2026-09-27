global.__basedir = __dirname;
require('dotenv').config()
const apiRouter = require('./router');
const cors = require('cors');
const { errorHandler } = require('./utils');
const dbConnector = require('./config/db');
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

// On a cold start the request that woke the instance arrives before Mongo has
// finished connecting, so wait for the connection rather than rejecting it.
app.use('/api', (req, res, next) => {
  dbConnector().then(() => next(), (error) => {
    console.error('Database connection failed:', error.message);
    res.status(503).json({ message: 'Database is unavailable' });
  });
});

app.use('/api', apiRouter);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'car-manager-api' });
});

app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

const server = app.listen(config.port, '0.0.0.0', () => console.log(`Listening on port ${config.port}!`));

const shutdown = async () => {
  server.close();
  process.exit(0);
};

process.once('SIGTERM', shutdown);
process.once('SIGINT', shutdown);

// Start connecting immediately so the first request usually finds it ready.
dbConnector().catch((error) => {
  console.error('Database connection failed:', error.message);
});