const { signUp, login } = require('./user-controller');
const { createFriendship, getFriendships, getFriendRequests, acceptFriendRequest, deleteFriendRequest } = require('./friends-controller');
const { addMeals } = require('./meal-controller'); 
const { addNaps } = require('./nap-controller');
const { addSleep } = require('./sleep-controller'); // Ensure this line is included if you are adding sleep times
const jwt = require('jsonwebtoken');
const parseJsonBody = require('../utils/parse-json-body');

const JWT_SECRET = process.env.JWT_SECRET || 'baby-shark';

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
        try {
            if (!req.headers.authorization) {
                throw new Error('Authorization header is missing');
            }
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, JWT_SECRET);
            req.userId = decodedToken.userId;
            await getFriendships(req, res);
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    } else if (req.url === '/api/friend-requests' && req.method === 'GET') {
        try {
            if (!req.headers.authorization) {
                throw new Error('Authorization header is missing');
            }
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, JWT_SECRET);
            req.userId = decodedToken.userId;
            await getFriendRequests(req, res);
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    } else if (req.url === '/api/accept-friend-request' && req.method === 'POST') {
        await parseJsonBody(req);
        await acceptFriendRequest(req, res);
    } else if (req.url === '/api/delete-friend-request' && req.method === 'POST') {
        await parseJsonBody(req);
        await deleteFriendRequest(req, res);
    } else if (req.url === '/api/meals' && req.method === 'POST') { 
        await addMeals(req, res);
    } else if (req.url === '/api/naps' && req.method === 'POST') { // Ensure this line is included if you are adding naps
        await addNaps(req, res);
    } else if (req.url === '/api/sleep' && req.method === 'POST') { // Ensure this line is included if you are adding sleep times
        await addSleep(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
};

module.exports = handleApiRequest;
