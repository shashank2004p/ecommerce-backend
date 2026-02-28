/**
 * JWT authentication middleware.
 * Expects Authorization: Bearer <token>. Sets req.user (id, email, role).
 */
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.model.js';

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required', data: null });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('name email role');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found', data: null });
    }
    req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token', data: null });
    }
    next(err);
  }
}

/**
 * Optional auth: sets req.user if valid token present, does not reject.
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      req.user = null;
      return next();
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('id name email role');
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
}
