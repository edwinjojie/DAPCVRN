/**
 * Role-based middleware for protecting routes
 */

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Check if user is university/institution
 */
export function requireUniversity(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowedRoles = ['university', 'institution'];
  const userRole = (req.user.role || '').toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ 
      error: 'Only university users can access this resource',
      userRole: req.user.role
    });
  }

  next();
}

/**
 * Check if user is an admin
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if ((req.user.role || '').toLowerCase() !== 'admin') {
    return res.status(403).json({ 
      error: 'Only administrators can access this resource',
      userRole: req.user.role
    });
  }

  next();
}