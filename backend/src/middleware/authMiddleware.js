const jwt = require('jsonwebtoken');
const config = require('../config/env');
const UserModel = require('../models/userModel');

/**
 * Protect endpoints by verifying Bearer JWT
 */
const protect = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        error: 'Unauthorized',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token',
        error: 'Unauthorized',
      });
    }

    // Attach user payload
    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
        error: 'TokenExpired',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
      error: 'Unauthorized',
    });
  }
};

module.exports = protect;
