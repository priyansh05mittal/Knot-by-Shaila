const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT from cookie or Authorization header.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please log in to continue.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('User belonging to this token no longer exists.');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact support.');
  }

  req.user = user;
  next();
});

/**
 * Restrict access to specific roles, e.g. restrictTo('admin')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token present, but does not block request.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.cookies?.token) token = req.cookies.token;
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && !user.isBlocked) req.user = user;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
});

module.exports = { protect, restrictTo, optionalAuth };
