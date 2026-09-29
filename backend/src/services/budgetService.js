const BudgetModel = require('../models/budgetModel');
const ExpenseModel = require('../models/expenseModel');
const { roundToTwo, calculateBudgetUsage } = require('../utils/calculations');

class BudgetService {
  /**
   * Get budgets for a month/year with real-time calculated spending and threshold warnings
   */
  static async getBudgetsWithStatus(userId, month, year) {
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    // Determine start and end date for target month
    const startStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const endStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Parallel fetch: budgets and expenses for the month
    const [budgets, monthExpenses] = await Promise.all([
      BudgetModel.findAll({ userId, month: targetMonth, year: targetYear }),
      ExpenseModel.getByDateRange(userId, startStr, endStr),
    ]);

    // Aggregate expenses by category
    const categorySpending = {};
    monthExpenses.forEach((exp) => {
      const cat = exp.category;
      categorySpending[cat] = (categorySpending[cat] || 0) + (parseFloat(exp.amount) || 0);
    });

    let totalBudgeted = 0;
    let totalSpentInBudgets = 0;

    const budgetStatusList = budgets.map((b) => {
      const budgetAmount = parseFloat(b.amount) || 0;
      const spent = roundToTwo(categorySpending[b.category] || 0);
      const remaining = roundToTwo(budgetAmount - spent);
      const percentageUsed = calculateBudgetUsage(spent, budgetAmount);

      totalBudgeted += budgetAmount;
      totalSpentInBudgets += spent;

      let status = 'normal'; // normal (<80%), warning (>=80%), exceeded (>=100%)
      if (percentageUsed >= 100) {
        status = 'exceeded';
      } else if (percentageUsed >= 80) {
        status = 'warning';
      }

      return {
        id: b.id,
        category: b.category,
        amount: budgetAmount,
        spent,
        remaining,
        percentageUsed,
        status,
        month: b.month,
        year: b.year,
        created_at: b.created_at,
        updated_at: b.updated_at,
      };
    });

    const overallPercentage = calculateBudgetUsage(totalSpentInBudgets, totalBudgeted);

    return {
      month: targetMonth,
      year: targetYear,
      totalBudgeted: roundToTwo(totalBudgeted),
      totalSpent: roundToTwo(totalSpentInBudgets),
      overallPercentage,
      budgets: budgetStatusList,
    };
  }
}

module.exports = BudgetService;
