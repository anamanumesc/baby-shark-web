const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const handleApiRequest = require('./controllers/api-controller');
const { handleViewRequest } = require('./views/view-controller');

dotenv.config();

const PORT = 7080;
const MONGOURL = "mongodb://localhost:27017/baby-shark";

mongoose.connect(MONGOURL).then(() => {
    console.log("Database connected successfully.");
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});

const serveStaticFile = (filePath, contentType, res) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('500 - Internal Server Error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
};

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api')) {
        handleApiRequest(req, res);
    } else if (req.url.startsWith('/frontend/styles')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'text/css', res);
    } else if (req.url.startsWith('/frontend/scripts')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'application/javascript', res);
    } else if (req.url.startsWith('/frontend/images')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'image/png', res);
    } else {
        handleViewRequest(req, res);
    }
});
