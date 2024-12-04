const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

// try {
//   // Resolve certificate paths
//   const keyPath = path.join(__dirname, 'cert', 'localhost-cert.pem');
//   const certPath = path.join(__dirname, 'cert', 'localhost.pem');

//   console.log(`Loading key from ${keyPath}`);
//   console.log(`Loading cert from ${certPath}`);

//   const key = fs.readFileSync(keyPath);
//   const cert = fs.readFileSync(certPath);

//   https.createServer({ key, cert }, app).listen(3000, () => {
//     console.log('Server is running at https://localhost:3000');
//   });
// } catch (error) {
//   console.error('Failed to start server:', error);
// }

const options = {
  key: fs.readFileSync(path.join(__dirname, 'cert/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert/localhost.pem')),
};

const server = https.createServer(options, app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

// https.createServer(sslOptions, app).listen(3000, () => {
//   console.log('Secure server running on https://localhost:3000');
// });

//openssl req -new -newkey -nodes -keyout server.key -out server.csr -days 365

//openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

// Step 1 => generate key-pairs to output [file] with specifications for key size // openssl genrsa -out [key-pair-file] [## size]
// Step 2 => Extract public key from key pair // openssl rsa -in [key-pair-file] -pubout -out [pub-key-file]
// Step 3 => Create certificate signing request to be self-signed (normally CSR in production is sent to CA to be signed) // openssl req -new -key [key-pair-file] -out [csr-file]
// Step 4 => Fill in fields in terminal for CSR
//
