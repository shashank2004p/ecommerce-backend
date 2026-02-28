/**
 * Simple request validation helpers.
 * For stricter validation consider using express-validator or joi.
 */
export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: 'Name is required', data: null });
  }
  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required', data: null });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters', data: null });
  }
  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required', data: null });
  }
  next();
}
