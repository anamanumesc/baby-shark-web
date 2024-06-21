const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');

dotenv.config();

const PORT = process.env.PORT || 7081;
const MONGOURL = process.env.MONGO_URL || "mongodb://localhost:27017/baby-shark";

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
  routes(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});