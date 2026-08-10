const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;

  if (req.session && req.session.user) {
    req.user = req.session.user;
    res.locals.user = req.user;
    return next();
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_jwt_secret_student_system_2026');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        res.locals.user = user;
        return next();
      }
    } catch (err) {}
  }

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Token or active session required.'
    });
  }

  return res.redirect('/login');
};

module.exports = { protect };
