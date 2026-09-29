const BudgetModel = require('../models/budgetModel');
const BudgetService = require('../services/budgetService');

class BudgetController {
  /**
   * Set or update a category budget
   */
  static async createBudget(req, res, next) {
    try {
      const { category, amount, month, year } = req.body;

      const budget = await BudgetModel.upsert({
        userId: req.user.id,
        category,
        amount,
        month,
        year,
      });

      return res.status(201).json({
        success: true,
        message: 'Budget saved successfully',
        data: { budget },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all budgets for the authenticated user
   */
  static async getBudgets(req, res, next) {
    try {
      const { month, year } = req.query;
      const budgets = await BudgetModel.findAll({
        userId: req.user.id,
        month,
        year,
      });

      return res.status(200).json({
        success: true,
        message: 'Budgets retrieved successfully',
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get calculated real-time budget status with spent amounts and 80%/100% warnings
   */
  static async getBudgetStatus(req, res, next) {
    try {
      const { month, year } = req.query;
      const statusData = await BudgetService.getBudgetsWithStatus(
        req.user.id,
        month,
        year
      );

      return res.status(200).json({
        success: true,
        message: 'Budget status calculated successfully',
        data: statusData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get budget by ID
   */
  static async getBudgetById(req, res, next) {
    try {
      const { id } = req.params;
      const budget = await BudgetModel.findById(id, req.user.id);

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or access denied',
          error: 'NotFound',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Budget retrieved successfully',
        data: { budget },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update budget
   */
  static async updateBudget(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await BudgetModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or access denied',
          error: 'NotFound',
        });
      }

      const updated = await BudgetModel.update(id, req.user.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: { budget: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete budget
   */
  static async deleteBudget(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await BudgetModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found or access denied',
          error: 'NotFound',
        });
      }

      await BudgetModel.delete(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully',
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BudgetController;
