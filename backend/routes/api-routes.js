const handleApiRequest = require('../controllers/api-controller');
const { upload, handleUpload } = require('../controllers/upload-controller');
const { getUploads } = require('../controllers/upload-controller');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'baby-shark';
const sleepController = require('../controllers/sleep-controller');
const napController = require('../controllers/nap-controller');

const apiRoutes = async (req, res) => {
    if (req.url === '/api/upload' && req.method === 'POST') {
        // Verify JWT token
        try {
            const cookieHeader = req.headers.cookie;

            if (!cookieHeader) throw new Error('Authorization header is missing');

            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));

            if (!token) throw new Error('Token not found in cookies');

            const tokenValue = token.split('=')[1];
            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;

            // Handle file upload
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
    } else if (req.url.startsWith('/api/uploads') && req.method === 'GET') {
        // Verify JWT token
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
        }
    } else if (req.url === '/api/get-sleep-times' && req.method === 'GET') {
        await sleepController.getSleepTimes(req, res);
    } else if (req.url === '/api/get-nap-times' && req.method === 'GET') {
        await napController.getNapTimes(req, res);
    } else if (req.url === '/api/delete-sleep-naps' && req.method === 'DELETE') {
        await sleepController.deleteAllSleepNaps(req, res);
    } else {
        handleApiRequest(req, res);
    }
};

module.exports = apiRoutes;
