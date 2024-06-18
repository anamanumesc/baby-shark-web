const path = require('path');
const { serveStaticFile } = require('../utils/serve-static');

const staticRoutes = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith('/frontend/html/')) {
    const filePath = path.join(__dirname, '../../frontend/html', pathname.replace('/frontend/html/', ''));
    serveStaticFile(filePath, 'text/html', res);
  } else if (pathname.startsWith('/frontend/styles/')) {
    const filePath = path.join(__dirname, '../../frontend/styles', pathname.replace('/frontend/styles/', ''));
    serveStaticFile(filePath, 'text/css', res);
  } else if (pathname.startsWith('/frontend/scripts/')) {
    const filePath = path.join(__dirname, '../../frontend/scripts', pathname.replace('/frontend/scripts/', ''));
    serveStaticFile(filePath, 'application/javascript', res);
  } else if (pathname.startsWith('/frontend/images/')) {
    const filePath = path.join(__dirname, '../../frontend/images', pathname.replace('/frontend/images/', ''));
    serveStaticFile(filePath, 'image/png', res); // Adjust the content type based on your images
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Not Found');
  }
};

module.exports = staticRoutes;
