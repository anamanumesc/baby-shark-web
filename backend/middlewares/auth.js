const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
    const token = req.headers.cookie.split('=')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        console.error('Invalid token:', error.message);
        return null;
    }
};

module.exports = { getUserIdFromToken };
