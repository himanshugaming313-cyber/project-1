const express = require('express');
const router = express.Router();
const IncomeController = require('../controllers/incomeController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { incomeValidator } = require('../validators/expenseValidator');

// All income routes require authentication
router.use(protect);

router.post('/', incomeValidator, validate, IncomeController.createIncome);
router.get('/', IncomeController.getIncomes);
router.get('/:id', IncomeController.getIncomeById);
router.put('/:id', incomeValidator, validate, IncomeController.updateIncome);
router.delete('/:id', IncomeController.deleteIncome);

module.exports = router;
