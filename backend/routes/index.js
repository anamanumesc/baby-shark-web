const apiRoutes = require('./api-routes');
const staticRoutes = require('./static-routes');
const viewRoutes = require('./view-routes');

const router = (req, res) => {
    if (req.url.startsWith('/api')) {
        apiRoutes(req, res);
    } else if (req.url.startsWith('/frontend')) {
        staticRoutes(req, res);
    } else {
        viewRoutes(req, res);
    }
};

module.exports = router;
