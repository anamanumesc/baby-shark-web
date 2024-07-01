const http = require('http');
const mongoose = require('mongoose');
const routes = require('./routes');
const staticRoutes = require('./routes/static-routes');

const PORT = 7083;
const MONGOURL = "mongodb://localhost:27017/baby-shark";

mongoose.connect(MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Failed to connect to MongoDB: ${err.message}`);
});

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/view') || req.url.startsWith('/uploads')) {
    staticRoutes(req, res);
  } else {
    routes(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
