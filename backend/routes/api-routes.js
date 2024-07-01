const { upload, handleUpload, getUploads, deletePost } = require('../controllers/upload-controller');
const { getMemorableMoments } = require('../controllers/see-memorable-controller');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'baby-shark';
const sleepController = require('../controllers/sleep-controller');
const napController = require('../controllers/nap-controller');
const mealController = require('../controllers/meal-controller');
const userController = require('../controllers/user-controller');
const handleApiRequest = require('../controllers/api-controller');
const parseJsonBody = require('../utils/parse-json-body');

const parseQuery = (url) => {
    const query = {};
    const [path, queryString] = url.split('?');
    if (queryString) {
        queryString.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            query[decodeURIComponent(key)] = decodeURIComponent(value);
        });
    }
    return { path, query };
};

const apiRoutes = async (req, res) => {
    const { path, query } = parseQuery(req.url);

    if (path === '/api/upload' && req.method === 'POST') {
        try {
            const cookieHeader = req.headers.cookie;
            if (!cookieHeader) throw new Error('Authorization header is missing');
            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
            if (!token) throw new Error('Token not found in cookies');
            const tokenValue = token.split('=')[1];
            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;

            upload.single('file')(req, res, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: err.message }));
                }
                handleUpload(req, res);
            });
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    } else if (path.startsWith('/api/uploads') && req.method === 'GET') {
        try {
            const cookieHeader = req.headers.cookie;
            if (!cookieHeader) throw new Error('Authorization header is missing');
            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
            if (!token) throw new Error('Token not found in cookies');
            const tokenValue = token.split('=')[1];
            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;

            getUploads(req, res);
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }  } else if (path.startsWith('/api/uploads') && req.method === 'DELETE') {
            try {
                const cookieHeader = req.headers.cookie;
                if (!cookieHeader) throw new Error('Authorization header is missing');
                const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
                if (!token) throw new Error('Token not found in cookies');
                const tokenValue = token.split('=')[1];
                const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
                req.userId = decodedToken.userId;
    
                // Extract postId from the URL
                const postId = path.split('/').pop();
                req.params = { postId };
    
                await deletePost(req, res);
            } catch (error) {
                console.error('Error verifying token:', error.message);
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Unauthorized' }));
            }

    } else  if (req.url.startsWith('/api/see-memorable') && req.method === 'GET') {
        try {
            const friendTag = new URL(req.url, `http://${req.headers.host}`).searchParams.get('friendTag');
            const cookieHeader = req.headers.cookie;
            if (!cookieHeader) throw new Error('Authorization header is missing');
            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
            if (!token) throw new Error('Token not found in cookies');
            const tokenValue = token.split('=')[1];
            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;

            await getMemorableMoments(friendTag, req.userId, res);
        } catch (error) {
            console.error('Error verifying token:', error.message);
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
    } else if (path === '/api/get-sleep-times' && req.method === 'GET') {
        await sleepController.getSleepTimes(req, res);
    } else if (path === '/api/get-nap-times' && req.method === 'GET') {
        await napController.getNapTimes(req, res);
    } else if (path === '/api/delete-sleep-naps' && req.method === 'DELETE') {
        await sleepController.deleteAllSleepNaps(req, res);
    } else if (path === '/api/meals' && req.method === 'POST') {
        await mealController.addMeals(req, res);
    } else if (path === '/api/delete-meals' && req.method === 'DELETE') {
        await mealController.deleteAllMeals(req, res);
    } else if (path === '/api/get-meal-times' && req.method === 'GET') {
        await mealController.getMealTimes(req, res);
    } else if (path === '/api/get-non-admin-users' && req.method === 'GET') {
        await userController.getNonAdminUsers(req, res);
    } else if (path === '/api/ban-user' && req.method === 'POST') {
        await parseJsonBody(req);
        await userController.banUser(req, res);
    } else {
        handleApiRequest(req, res);
    }
};

module.exports = apiRoutes;
