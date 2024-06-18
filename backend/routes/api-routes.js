const { signUp, login } = require('../controllers/user-controller');
const parseJsonBody = require('../utils/parse-json-body');

const apiRoutes = async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  if (pathname === '/api/signup' && req.method === 'POST') {
    await parseJsonBody(req);
    await signUp(req, res);
  } else if (pathname === '/api/login' && req.method === 'POST') {
    await parseJsonBody(req);
    await login(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'API route not found' }));
  }
};

module.exports = apiRoutes;
