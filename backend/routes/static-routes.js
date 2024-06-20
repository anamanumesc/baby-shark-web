const path = require('path');
const fs = require('fs');
const { getUserIdFromToken } = require('../middlewares/auth');

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
  const userId = getUserIdFromToken(req);
  if (!userId) {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>401 Unauthorized</h1><p>You need to log in to access this page.</p></body></html>');
    return false;
  }
  return true;
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
    if (req.url === '/frontend/main-page.html' || req.url.startsWith('/frontend/html')) {
      if (!checkAuth(req, res)) return;
    }
    const filePath = path.join(__dirname, '../../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  }
};

module.exports = staticRoutes;
