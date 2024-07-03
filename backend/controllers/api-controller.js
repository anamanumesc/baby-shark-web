const jwt = require('jsonwebtoken');
const parseJsonBody = require('../utils/parse-json-body');
const userController = require('./user-controller');
const friendsController = require('./friends-controller');
const mealController = require('./meal-controller');
const napController = require('./nap-controller');
const medicalController = require('./medical-controller');
const sleepController = require('./sleep-controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const JWT_SECRET = 'baby-shark';//hardcodat ca nu mergea in .env

const handleApiRequest = async (req, res) => {
    if (req.url === '/api/signup' && req.method === 'POST') {
        await parseJsonBody(req);
        await userController.signUp(req, res);
    } else if (req.url === '/api/login' && req.method === 'POST') {
        await parseJsonBody(req);
        await userController.login(req, res);
    } else {
        try {
            const cookieHeader = req.headers.cookie;
            if (!cookieHeader) throw new Error('Authorization header is missing');
            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
            if (!token) throw new Error('Token not found in cookies');
            const tokenValue = token.split('=')[1];
            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        if (req.url === '/api/friends' && req.method === 'POST') {
            await parseJsonBody(req);
            await friendsController.createFriendship(req, res);
        } else if (req.url === '/api/friends' && req.method === 'GET') {
            await friendsController.getFriendships(req, res);
        } else if (req.url === '/api/friend-requests' && req.method === 'GET') {
            await friendsController.getFriendRequests(req, res);
        } else if (req.url === '/api/accept-friend-request' && req.method === 'POST') {
            await parseJsonBody(req);
            await friendsController.acceptFriendRequest(req, res);
        } else if (req.url === '/api/delete-friend-request' && req.method === 'POST') {
            await parseJsonBody(req);
            await friendsController.deleteFriendRequest(req, res);
        } else if (req.url === '/api/meals' && req.method === 'POST') {
            await mealController.addMeals(req, res);
        } else if (req.url === '/api/naps' && req.method === 'POST') {
            await napController.addNaps(req, res);
        } else if (req.url === '/api/reset-meal-form' && req.method === 'POST') {
            await mealController.resetMealForm(req, res);
        } else if (req.url === '/api/reset-sleep-form' && req.method === 'POST') {
            await napController.resetSleepForm(req, res);
        } else if (req.url === '/api/medical' && req.method === 'POST') {
            upload.single('pdf')(req, res, async (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: err.message }));
                }
                await medicalController.addMedicalVisit(req, res);
            });
        } else if (req.url === '/api/medical' && req.method === 'GET') {
            await medicalController.getMedicalVisits(req, res);
        } else if (req.url === '/api/get-sleep-times' && req.method === 'GET') {
            await sleepController.getSleepTimes(req, res);
        } else if (req.url === '/api/get-non-admin-users' && req.method === 'GET') {
            await userController.getNonAdminUsers(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    }
};

module.exports = handleApiRequest;
