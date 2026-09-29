const { body } = require('express-validator');

const VALID_CATEGORIES = [
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'Gaming',
  'Health',
  'Bills',
  'Travel',
  'Personal',
  'Other',
];

const VALID_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

const expenseValidator = [
  body('title').trim().notEmpty().withMessage('Expense title is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('payment_method')
    .optional()
    .isIn(VALID_PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`),
  body('expense_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Expense date must be a valid date (YYYY-MM-DD)'),
  body('is_necessary').optional().isBoolean().withMessage('is_necessary must be a boolean'),
  body('description').optional().isString().trim(),
];

const incomeValidator = [
  body('source').trim().notEmpty().withMessage('Income source is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  body('income_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Income date must be a valid date (YYYY-MM-DD)'),
  body('description').optional().isString().trim(),
];

module.exports = {
  expenseValidator,
  incomeValidator,
  VALID_CATEGORIES,
  VALID_PAYMENT_METHODS,
};
