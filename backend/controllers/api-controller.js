const { signUp, login } = require('./user-controller');
const { createFriendship, getFriendships, getFriendRequests, acceptFriendRequest, deleteFriendRequest } = require('./friends-controller');
const jwt = require('jsonwebtoken');
const parseJsonBody = require('../utils/parse-json-body');

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'baby-shark';

const authenticate = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Authorization header is missing' }));
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.userId = decodedToken.userId;
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }
};

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
    if (authenticate(req, res)) {
      await getFriendships(req, res);
    }
  } else if (req.url === '/api/friend-requests' && req.method === 'GET') {
    if (authenticate(req, res)) {
      await getFriendRequests(req, res);
    }
  } else if (req.url === '/api/accept-friend-request' && req.method === 'POST') {
    if (authenticate(req, res)) {
      await parseJsonBody(req);
      await acceptFriendRequest(req, res);
    }
  } else if (req.url === '/api/delete-friend-request' && req.method === 'POST') {
    if (authenticate(req, res)) {
      await parseJsonBody(req);
      await deleteFriendRequest(req, res);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
};

module.exports = handleApiRequest;
