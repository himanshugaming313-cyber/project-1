const AnalyticsService = require('../services/analyticsService');

class AnalyticsController {
  /**
   * Get financial summary (income, expenses, remaining, savings rate, MoM change)
   */
  static async getSummary(req, res, next) {
    try {
      const summary = await AnalyticsService.getSummary(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Summary calculated successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get spending breakdown by category
   */
  static async getCategoryBreakdown(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await AnalyticsService.getCategories(req.user.id, startDate, endDate);
      return res.status(200).json({
        success: true,
        message: 'Category breakdown calculated successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get 6-month historical monthly trend
   */
  static async getMonthlyTrend(req, res, next) {
    try {
      const trend = await AnalyticsService.getMonthlyTrend(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Monthly trend retrieved successfully',
        data: trend,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily spending for chart
   */
  static async getDailySpending(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const daily = await AnalyticsService.getDailySpending(req.user.id, startDate, endDate);
      return res.status(200).json({
        success: true,
        message: 'Daily spending retrieved successfully',
        data: daily,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get spending comparison for preset or custom periods
   */
  static async getComparison(req, res, next) {
    try {
      const { rangeKey = 'this_month', startDate, endDate } = req.query;
      const comparison = await AnalyticsService.getComparison(
        req.user.id,
        rangeKey,
        startDate,
        endDate
      );
      return res.status(200).json({
        success: true,
        message: 'Comparison calculated successfully',
        data: comparison,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get deep spending pattern statistics
   */
  static async getSpendingPatterns(req, res, next) {
    try {
      const patterns = await AnalyticsService.getSpendingPatterns(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Spending patterns analyzed successfully',
        data: patterns,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
