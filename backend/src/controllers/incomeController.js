const IncomeModel = require('../models/incomeModel');

class IncomeController {
  /**
   * Add income record
   */
  static async createIncome(req, res, next) {
    try {
      const { source, amount, income_date, description } = req.body;

      const income = await IncomeModel.create({
        userId: req.user.id,
        source,
        amount,
        incomeDate: income_date,
        description,
      });

      return res.status(201).json({
        success: true,
        message: 'Income added successfully',
        data: { income },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all income records for user
   */
  static async getIncomes(req, res, next) {
    try {
      const incomes = await IncomeModel.findAll(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Income records retrieved successfully',
        data: incomes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get income by ID
   */
  static async getIncomeById(req, res, next) {
    try {
      const { id } = req.params;
      const income = await IncomeModel.findById(id, req.user.id);

      if (!income) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found or access denied',
          error: 'NotFound',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Income record retrieved successfully',
        data: { income },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update income record
   */
  static async updateIncome(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await IncomeModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found or access denied',
          error: 'NotFound',
        });
      }

      const updated = await IncomeModel.update(id, req.user.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Income record updated successfully',
        data: { income: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete income record
   */
  static async deleteIncome(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await IncomeModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Income record not found or access denied',
          error: 'NotFound',
        });
      }

      await IncomeModel.delete(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Income record deleted successfully',
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IncomeController;
