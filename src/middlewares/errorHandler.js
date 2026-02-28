/**
 * Central error handling middleware.
 * Handles validation, JWT, and generic errors with consistent { success, message, data } format.
 */
import config from '../config/index.js';

const isDev = config.env === 'development';

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join('; ') || 'Validation failed';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value for a unique field';
  } else if (err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // In production, do not expose internal error messages for 500
  const safeMessage = !isDev && statusCode === 500 ? 'Internal server error' : message;
  const payload = {
    success: false,
    message: safeMessage,
    data: null,
  };

  if (isDev && statusCode === 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
