const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const handleApiRequest = require('./controllers/api-controller');
const { login, signUp } = require('./controllers/user-controller');
const { handleViewRequest } = require('./views/view-controller');

const PORT = 7081;
const MONGOURL = "mongodb://localhost:27017/baby-shark";

// Connect to MongoDB
mongoose.connect(MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error(`Failed to connect to MongoDB: ${err.message}`);
});

// Function to serve static files
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

// Create server and handle requests
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    // Special case for main-page.html
    if (req.url === '/frontend/main-page.html') {
        const filePath = path.join(__dirname, '../frontend/main-page.html');
        serveStaticFile(filePath, 'text/html', res);
    } 
    // Serve CSS files
    else if (req.url.startsWith('/frontend/styles')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'text/css', res);
    } 
    // Serve JavaScript files
    else if (req.url.startsWith('/frontend/scripts')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'application/javascript', res);
    } 
    // Serve image files
    else if (req.url.startsWith('/frontend/images')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'image/png', res);
    } 
    // Serve HTML files
    else if (req.url.startsWith('/frontend/html')) {
        const filePath = path.join(__dirname, '../', req.url);
        serveStaticFile(filePath, 'text/html', res);
    } 
    // Handle API requests
    else if (req.url.startsWith('/api')) {
        if (req.method === 'POST' && req.url === '/api/login') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                req.body = JSON.parse(body);
                login(req, res);
            });
        } else if (req.method === 'POST' && req.url === '/api/signup') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                req.body = JSON.parse(body);
                signUp(req, res);
            });
        } else {
            handleApiRequest(req, res);
        }
    } 
    // Handle other view requests
    else {
        handleViewRequest(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
