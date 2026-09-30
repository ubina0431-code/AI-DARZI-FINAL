const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { memoryDB } = require('../memoryStore');
const { mongoose } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'ai_darzi_jwt_secret_key_2026_super_secure';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryDB.users.find(u => String(u._id) === String(decoded.id) || u.email === decoded.email);
      if (user) {
        user = { ...user };
        delete user.password;
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'User associated with token not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole, JWT_SECRET };
