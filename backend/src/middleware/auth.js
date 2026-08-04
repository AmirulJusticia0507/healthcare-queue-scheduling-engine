const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../modules/auth/auth.service');

function verifyToken(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization'];
  const token = header && (header.startsWith('Bearer ') ? header.slice(7) : header);
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyToken };
