const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User record not found.' });
      }

      if (req.user.deletedAt) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been disabled. The administrator is monitoring your account.',
        });
      }

      // Require verified email for every account, including administrators.
      if (!req.user.isVerified) {
        return res.status(403).json({ success: false, message: 'Account not verified. Check your Brevo email.' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this resource.' });
    }
    next();
  };
};

module.exports = { protect, authorize };
