const { handleViewRequest } = require('../controllers/view-controller');

const viewRoutes = (req, res) => {
  handleViewRequest(req, res);
};

module.exports = viewRoutes;
