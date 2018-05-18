const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

const server = http.createServer(app);

// server.listen(port);
server.listen(port, host);