const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { expenseValidator } = require('../validators/expenseValidator');

// All expense routes require authentication
router.use(protect);

router.post('/', expenseValidator, validate, ExpenseController.createExpense);
router.get('/', ExpenseController.getExpenses);
router.get('/:id', ExpenseController.getExpenseById);
router.put('/:id', expenseValidator, validate, ExpenseController.updateExpense);
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
