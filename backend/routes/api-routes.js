const handleApiRequest = require('../controllers/api-controller');

const apiRoutes = (req, res) => {
  handleApiRequest(req, res);
};

module.exports = apiRoutes;
