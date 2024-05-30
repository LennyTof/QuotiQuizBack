const http = require('http');
const app = require('./app');
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

// Code pour récupérer l'adresse IP statique en production uniquement
if (process.env.QUOTAGUARDSTATIC_URL) {
  const options = {
      hostname: process.env.QUOTAGUARDSTATIC_URL,
      port: 80,
      path: 'http://ip.quotaguard.com/',
      headers: {
          'Proxy-Authorization': `Basic ${Buffer.from(process.env.QUOTAGUARDSTATIC_USERNAME + ':' + process.env.QUOTAGUARDSTATIC_PASSWORD).toString('base64')}`,
      }
  };

  http.get(options, (res) => {
      let data = '';

      // A chaque chunk de données reçu, on l'ajoute à la variable 'data'
      res.on('data', (chunk) => {
          data += chunk;
      });

      // Une fois que toutes les données ont été reçues, on les traite
      res.on('end', () => {
          const ipAddress = JSON.parse(data).ip;
          console.log('Adresse IP statique récupérée:', ipAddress);
          process.env.IP_ADDRESS = ipAddress; // Stockez l'adresse IP dans une variable d'environnement
      });
  }).on('error', (err) => {
      console.error('Erreur lors de la récupération de l\'adresse IP statique:', err.message);
  });
}

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
  const bind = `port ${port}`;
  console.log(`Listening on ${bind}`);
});

server.listen(port);
