const jwt = require('jsonwebtoken');

const getUserIdFromToken = (req) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
  if (!token) return null;

  const tokenValue = token.split('=')[1];
  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    console.error('Invalid token:', error.message);
    return null;
  }
};

module.exports = { getUserIdFromToken };
