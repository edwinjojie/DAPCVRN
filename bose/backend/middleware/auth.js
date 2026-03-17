/**
 * middleware/auth.js
 * Authentication removed – JWT has been stripped out.
 *
 * This middleware now just passes through and sets req.user from
 * the x-user-id / x-user-role / x-user-email request headers that
 * the frontend sends after a successful login.
 *
 * If no headers are present, req.user is set to a guest object
 * so route handlers that check req.user don't crash.
 */

export function authenticateToken(req, res, next) {
  // Read plain headers sent by the frontend after login
  const userId       = req.headers['x-user-id']    || null;
  const userRole     = req.headers['x-user-role']   || 'guest';
  const userEmail    = req.headers['x-user-email']  || '';
  const organization = req.headers['x-user-org']    || '';

  req.user = { userId, role: userRole, email: userEmail, organization };
  next();
}

/**
 * Middleware to ensure the user is a recruiter.
 * Must be used AFTER authenticateToken.
 */
export function requireRecruiter(req, res, next) {
  if (!req.user || req.user.role !== 'recruiter') {
    return res.status(403).json({ error: 'Access denied: Recruiters only' });
  }
  next();
}

export default authenticateToken;