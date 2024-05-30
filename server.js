const http = require('http');
const https = require('https');
const { Agent } = require('https-proxy-agent');
const url = require('url');
const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const normalizePort = val => parseInt(val, 10) || false;
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = `port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const bind = `port ${port}`;
  console.log(`Listening on ${bind}`);
});

server.listen(port);

// Configuration pour MongoDB
const mongoURI = process.env.MONGO_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

// Utiliser QuotaGuard en production
if (process.env.QUOTAGUARDSTATIC_URL) {
  const proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL);
  const proxyOpts = {
    hostname: proxy.hostname,
    port: proxy.port || 80,
    auth: proxy.auth,
  };

  const proxyAgent = new Agent(proxyOpts);
  options.agent = proxyAgent;  // Utiliser le proxy agent pour les requêtes MongoDB
}

mongoose.connect(mongoURI, options)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.error('Connexion à MongoDB échouée !', err);
    process.exit(1);
  });
