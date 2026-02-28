/**
 * Admin-only middleware. Must be used after authenticate.
 */
export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required', data: null });
  }
  next();
}
