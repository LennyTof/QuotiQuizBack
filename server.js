const http = require('http');
const app = require('./app');
const fs = require('fs');
const https = require('https');
const path = require('path');

const normalizePort = val => parseInt(val, 10) || false;
const port = normalizePort(process.env.PORT || '3000');
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

// En attente de la validation https

// const options = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl', 'privateKey.key')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
// };

// const server = https.createServer(options, app);

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const bind = `port ${port}`;
  console.log(`Listening on ${bind}`);
});

server.listen(port);
