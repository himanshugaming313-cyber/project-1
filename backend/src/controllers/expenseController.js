const ExpenseModel = require('../models/expenseModel');

class ExpenseController {
  /**
   * Create new expense for the authenticated user
   */
  static async createExpense(req, res, next) {
    try {
      const {
        title,
        amount,
        category,
        description,
        payment_method,
        expense_date,
        is_necessary,
      } = req.body;

      const expense = await ExpenseModel.create({
        userId: req.user.id,
        title,
        amount,
        category,
        description,
        paymentMethod: payment_method,
        expenseDate: expense_date,
        isNecessary: is_necessary,
      });

      return res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated, filtered expenses for authenticated user
   */
  static async getExpenses(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        payment_method,
        startDate,
        endDate,
        is_necessary,
        search,
        sortBy,
        order,
      } = req.query;

      const result = await ExpenseModel.findAll({
        userId: req.user.id,
        page,
        limit,
        category,
        paymentMethod: payment_method,
        startDate,
        endDate,
        isNecessary: is_necessary,
        search,
        sortBy,
        order,
      });

      return res.status(200).json({
        success: true,
        message: 'Expenses retrieved successfully',
        data: result.expenses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single expense by ID (strictly owned by user)
   */
  static async getExpenseById(req, res, next) {
    try {
      const { id } = req.params;
      const expense = await ExpenseModel.findById(id, req.user.id);

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or access denied',
          error: 'NotFound',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Expense retrieved successfully',
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update expense by ID (strictly owned by user)
   */
  static async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ExpenseModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or unauthorized to edit',
          error: 'NotFound',
        });
      }

      const updated = await ExpenseModel.update(id, req.user.id, req.body);

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: { expense: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete expense by ID (strictly owned by user)
   */
  static async deleteExpense(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await ExpenseModel.findById(id, req.user.id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found or unauthorized to delete',
          error: 'NotFound',
        });
      }

      await ExpenseModel.delete(id, req.user.id);

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
        data: { id },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ExpenseController;
