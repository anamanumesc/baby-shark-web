const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userController = require('./controllers/user-controller'); // Adjust the path if necessary

dotenv.config();

const PORT = 7020; // port number
const MONGOURL = "mongodb://localhost:27017/baby-shark"; //connextion to database

mongoose.connect(MONGOURL).then(() => {
    console.log("Database connected successfully.");
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Error connecting to the database:", err);
});

const server = http.createServer((req, res) => {
    if (req.url === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            userController.login(req, res);
        });
    } else if (req.url === '/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = JSON.parse(body);
            userController.signUp(req, res);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});
