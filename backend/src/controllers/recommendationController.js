const RecommendationService = require('../services/recommendationService');

class RecommendationController {
  /**
   * Get personalized rule-based financial recommendations and insights
   */
  static async getRecommendations(req, res, next) {
    try {
      const data = await RecommendationService.getRecommendations(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Recommendations generated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get educational financial health score and factors
   */
  static async getFinancialHealth(req, res, next) {
    try {
      const health = await RecommendationService.getFinancialHealth(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Financial health score calculated successfully',
        data: health,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecommendationController;
