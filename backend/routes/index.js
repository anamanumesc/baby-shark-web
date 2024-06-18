const staticRoutes = require('./static-routes');
const apiRoutes = require('./api-routes');

const router = (req, res) => {
  if (req.url.startsWith('/api')) {
    apiRoutes(req, res);
  } else {
    staticRoutes(req, res);
  }
};

module.exports = router;
