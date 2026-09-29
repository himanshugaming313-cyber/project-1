const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a signed JWT for the authenticated user
 * Never puts sensitive information into the token payload
 * @param {string} userId - The user's unique identifier (UUID)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

module.exports = generateToken;
