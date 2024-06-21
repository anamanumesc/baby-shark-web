const path = require('path');
const fs = require('fs');

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

const staticRoutes = (req, res) => {
  console.log(`Request URL: ${req.url}`);
  if (req.url === '/frontend/start-page.html') {
    const filePath = path.join(__dirname, '../../frontend/start-page.html');
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  } else if (req.url === '/frontend/main-page.html') {
    const filePath = path.join(__dirname, '../../frontend/main-page.html');
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  } else if (req.url.startsWith('/frontend/styles')) {
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/css', res);
  } else if (req.url.startsWith('/frontend/scripts')) {
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'application/javascript', res);
  } else if (req.url.startsWith('/frontend/images')) {
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'image/png', res);
  } else if (req.url.startsWith('/frontend/logo')) {
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'image/png', res);
  } else if (req.url.startsWith('/frontend/html')) {
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Not Found');
  }
};

module.exports = staticRoutes;