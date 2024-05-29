const path = require('path');
const fs = require('fs');

function handleViewRequest(req, res) {
    if (req.url === '/' && req.method === 'GET') {
        const filePath = path.join(__dirname, '../../frontend/html/start-page.html'); // corrected path
        console.log('Serving file:', filePath); // debugging line to ensure correct file path

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error('Error reading file:', err); // detailed error message
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Internal Server Error</h1>');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>Page Not Found</h1>');
    }
}

module.exports = { handleViewRequest };
