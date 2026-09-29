const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('currency').optional().isString().trim(),
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a non-negative number'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('currency').optional().isString().trim(),
  body('monthly_income')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly income must be a non-negative number'),
  body('password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
};
