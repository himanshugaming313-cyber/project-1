const express = require('express');
const router = express.Router();
const RecommendationController = require('../controllers/recommendationController');
const protect = require('../middleware/authMiddleware');

// All recommendation routes require authentication
router.use(protect);

router.get('/', RecommendationController.getRecommendations);
router.get('/financial-health', RecommendationController.getFinancialHealth);

module.exports = router;
