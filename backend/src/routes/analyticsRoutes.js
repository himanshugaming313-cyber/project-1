const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/summary', AnalyticsController.getSummary);
router.get('/categories', AnalyticsController.getCategoryBreakdown);
router.get('/monthly', AnalyticsController.getMonthlyTrend);
router.get('/daily', AnalyticsController.getDailySpending);
router.get('/comparison', AnalyticsController.getComparison);
router.get('/patterns', AnalyticsController.getSpendingPatterns);

module.exports = router;
