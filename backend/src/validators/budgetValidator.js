const { body } = require('express-validator');
const { VALID_CATEGORIES } = require('./expenseValidator');

const budgetValidator = [
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be a positive number greater than 0'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Year must be a valid four-digit year (e.g., 2026)'),
];

module.exports = {
  budgetValidator,
};
