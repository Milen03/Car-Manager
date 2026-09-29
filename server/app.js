// The Express app, without starting a server. index.js listens on a port for
// local development and Cloud Run; on Vercel the `server` service uses this file
// as its entrypoint (see vercel.json).
global.__basedir = global.__basedir || __dirname;
require('dotenv').config();

const apiRouter = require('./router');
const cors = require('cors');
const { errorHandler } = require('./utils');
const dbConnector = require('./config/db');
const config = require('./config/config');

const app = require('express')();
require('./config/express')(app);

// The client is served from the same origin as the API, and same-origin requests
// need no CORS headers. Other origins only get them if listed in CLIENT_ORIGIN;
// anything else is left without CORS headers (so the browser blocks it) rather
// than failing with a server error.
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || config.origin.includes(origin));
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

// Start connecting immediately so the first request usually finds it ready.
dbConnector().catch((error) => {
  console.error('Database connection failed:', error.message);
});

module.exports = app;
