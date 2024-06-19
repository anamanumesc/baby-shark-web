const { signUp, login } = require('./user-controller');
const { createFriendship, getFriendships } = require('./friends-controller');
const jwt = require('jsonwebtoken');
const parseJsonBody = require('../utils/parse-json-body');

const handleApiRequest = async (req, res) => {
    if (req.url === '/api/signup' && req.method === 'POST') {
        await parseJsonBody(req);
        await signUp(req, res);
    } else if (req.url === '/api/login' && req.method === 'POST') {
        await parseJsonBody(req);
        await login(req, res);
    } else if (req.url === '/api/friends' && req.method === 'POST') {
        await parseJsonBody(req);
        await createFriendship(req, res);
    } else if (req.url === '/api/friends' && req.method === 'GET') {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, "babyshark"); // replace with your secret
        req.userId = decodedToken.userId;
        await getFriendships(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
};

module.exports = handleApiRequest;
