const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/budgetController');
const protect = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { budgetValidator } = require('../validators/budgetValidator');

// All budget routes require authentication
router.use(protect);

router.post('/', budgetValidator, validate, BudgetController.createBudget);
router.get('/', BudgetController.getBudgets);
router.get('/status', BudgetController.getBudgetStatus);
router.get('/:id', BudgetController.getBudgetById);
router.put('/:id', BudgetController.updateBudget);
router.delete('/:id', BudgetController.deleteBudget);

module.exports = router;
