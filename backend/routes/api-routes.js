const handleApiRequest = require('../controllers/api-controller');
const { upload, handleUpload } = require('../controllers/upload-controller');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'baby-shark';

const apiRoutes = async (req, res) => {
    if (req.url === '/api/upload' && req.method === 'POST') {
        // Verify JWT token
        try {
            const cookieHeader = req.headers.cookie;
            console.log('Cookie Header:', cookieHeader); // Debugging line

            if (!cookieHeader) throw new Error('Authorization header is missing');

            const token = cookieHeader.split(';').find(c => c.trim().startsWith('clientToken='));
            console.log('Extracted Token:', token); // Debugging line

            if (!token) throw new Error('Token not found in cookies');

            const tokenValue = token.split('=')[1];
            console.log('Token Value:', tokenValue); // Debugging line

            const decodedToken = jwt.verify(tokenValue, JWT_SECRET);
            req.userId = decodedToken.userId;
            console.log('Decoded Token:', decodedToken); // Debugging line

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
    } else {
        handleApiRequest(req, res);
    }
};

module.exports = apiRoutes;
