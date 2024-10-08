const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'baby-shark';

const serveStaticFile = (filePath, contentType, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
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
  console.log('Cookies:', cookies);
  if (!cookies) {
    console.log('No cookies found');
    res.writeHead(302, { 'Location': '/frontend/html/401.html' });
    res.end();
    return false;
  }
  const token = cookies.split(';').find(cookie => cookie.trim().startsWith('clientToken='));
  if (!token) {
    console.log('No clientToken found in cookies');
    res.writeHead(302, { 'Location': '/frontend/html/401.html' });
    res.end();
    return false;
  }
  const tokenValue = token.split('=')[1];
  console.log('Token Value:', tokenValue);
  try {
    const decoded = jwt.verify(tokenValue, JWT_SECRET);
    console.log('Decoded Token:', decoded);
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
    '/views/start-page.html',
    '/public/styles',
    '/public/scripts',
    '/public/images',
    '/public/logo'
  ];

  if (publicPaths.some(path => req.url.startsWith(path)) || req.url.startsWith('/uploads')) {
    let filePath;
    if (req.url.startsWith('/uploads')) {
      filePath = path.join(__dirname, '../uploads', req.url.replace('/uploads', ''));
    } else {
      filePath = path.join(__dirname, '../', req.url);
    }

    const contentType = req.url.endsWith('.css') ? 'text/css' :
                        req.url.endsWith('.js') ? 'application/javascript' :
                        req.url.endsWith('.png') ? 'image/png' :
                        req.url.endsWith('.jpg') || req.url.endsWith('.jpeg') ? 'image/jpeg' :
                        req.url.endsWith('.gif') ? 'image/gif' :
                        req.url.endsWith('.mp4') ? 'video/mp4' :
                        req.url.endsWith('.webm') ? 'video/webm' :
                        req.url.endsWith('.ogg') ? 'video/ogg' :
                        req.url.endsWith('.mp3') ? 'audio/mpeg' :
                        req.url.endsWith('.wav') ? 'audio/wav' :
                        req.url.endsWith('.pdf') ? 'application/pdf' :
                        'text/html';
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, contentType, res);
  } else {
    if (
      req.url === '/views/main-page.html' ||
      req.url === '/views/eating-schedule-form.html' ||
      req.url === '/views/sleeping-schedule-form.html'
    ) {
      if (!checkAuth(req, res)) return;
    }
    const filePath = path.join(__dirname, '../', req.url);
    console.log(`Serving file: ${filePath}`);
    serveStaticFile(filePath, 'text/html', res);
  }
};

module.exports = staticRoutes;
