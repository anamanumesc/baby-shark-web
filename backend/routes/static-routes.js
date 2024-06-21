const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark'; // Hardcoded JWT secret

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

const checkAuth = (req, res) => {
  const cookies = req.headers.cookie;
  if (!cookies) {
    res.writeHead(302, { 'Location': '/frontend/html/401.html' });
    res.end();
    return false;
  }
  const token = cookies.split(';').find(cookie => cookie.trim().startsWith('clientToken=')).split('=')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    return true;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.writeHead(302, { 'Location': '/frontend/html/401.html' });
    res.end();
    return false;
  }
};

const staticRoutes = (req, res) => {
  console.log(`Request URL: ${req.url}`);

  const publicPaths = [
    '/frontend/html/start-page.html',
    '/frontend/styles',
    '/frontend/scripts',
    '/frontend/images',
    '/frontend/logo'
  ];

  if (publicPaths.some(path => req.url.startsWith(path))) {
    const filePath = path.join(__dirname, '../../', req.url);
    const contentType = req.url.endsWith('.css') ? 'text/css' :
                        req.url.endsWith('.js') ? 'application/javascript' :
                        req.url.endsWith('.png') ? 'image/png' : 'text/html';
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, contentType, res);
  } else {
    if (req.url === '/frontend/main-page.html' || req.url.startsWith('/frontend/html/eating-schedule-form.html')) {
      if (!checkAuth(req, res)) return;
    }
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  }
};

module.exports = staticRoutes;
