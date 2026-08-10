const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }
      return res.redirect('/login');
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.originalUrl.startsWith('/api/')) {
        return res.status(403).json({
          success: false,
          message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
        });
      }
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: `Your account role (${req.user.role}) does not have permission to view this section.`
      });
    }

    next();
  };
};

module.exports = { requireRole };
