const ExpenseModel = require('../models/expenseModel');
const IncomeModel = require('../models/incomeModel');
const BudgetModel = require('../models/budgetModel');
const UserModel = require('../models/userModel');
const BudgetService = require('./budgetService');
const {
  roundToTwo,
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateSavingsRate,
  calculateFinancialHealthScore,
} = require('../utils/calculations');

class RecommendationService {
  /**
   * Helper to get start and end dates for a month
   */
  static getMonthRange(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  /**
   * Generate personalized data-driven recommendations and structured insights
   */
  static async getRecommendations(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentRange = this.getMonthRange(currentYear, currentMonth);

    // Previous month range
    const prevDate = new Date(currentYear, currentMonth - 2, 1);
    const prevRange = this.getMonthRange(prevDate.getFullYear(), prevDate.getMonth() + 1);

    const [user, currentExpenses, currentIncomes, prevExpenses, budgetData] = await Promise.all([
      UserModel.findById(userId),
      ExpenseModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      IncomeModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      ExpenseModel.getByDateRange(userId, prevRange.startDate, prevRange.endDate),
      BudgetService.getBudgetsWithStatus(userId, currentMonth, currentYear),
    ]);

    const currency = user?.currency || '₹';
    const totalExpenses = calculateTotalExpenses(currentExpenses);
    const recordedIncome = calculateTotalIncome(currentIncomes);
    const totalIncome = recordedIncome > 0 ? recordedIncome : (parseFloat(user?.monthly_income) || 0);
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    const recommendations = [];

    // Category aggregation
    const categoryTotals = {};
    currentExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
    });

    // -------------------------------------------------------------
    // RULE 1: High Category Spending (>30% of total)
    // -------------------------------------------------------------
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (totalExpenses > 0) {
        const pct = roundToTwo((amount / totalExpenses) * 100);
        if (pct >= 30) {
          recommendations.push({
            id: `high-cat-${cat.toLowerCase()}`,
            type: 'category_alert',
            title: `High ${cat} Spending (${pct}%)`,
            message: `${cat} is taking a major portion (${pct}%) of your total expenses this month. Consider setting a weekly ${cat.toLowerCase()} limit to free up funds for other goals.`,
            category: cat,
            severity: 'warning',
            iconType: 'pie-chart',
          });
        }
      }
    });

    // -------------------------------------------------------------
    // RULE 2 & 3: Budget Warnings (>=80%) & Exceeded (>=100%)
    // -------------------------------------------------------------
    budgetData.budgets.forEach((b) => {
      if (b.percentageUsed >= 100) {
        const diff = roundToTwo(b.spent - b.amount);
        recommendations.push({
          id: `budget-exceeded-${b.category.toLowerCase()}`,
          type: 'budget_exceeded',
          title: `${b.category} Budget Exceeded!`,
          message: `Your ${b.category} spending (${currency}${b.spent}) has exceeded your limit of ${currency}${b.amount} by ${currency}${diff}. Rebalance spending elsewhere to stay on track.`,
          category: b.category,
          severity: 'alert',
          iconType: 'alert-triangle',
        });
      } else if (b.percentageUsed >= 80) {
        recommendations.push({
          id: `budget-warning-${b.category.toLowerCase()}`,
          type: 'budget_warning',
          title: `${b.category} Budget Warning (${roundToTwo(b.percentageUsed)}%)`,
          message: `You have spent ${roundToTwo(b.percentageUsed)}% of your ${b.category} budget. You have ${currency}${b.remaining} remaining this month.`,
          category: b.category,
          severity: 'warning',
          iconType: 'clock',
        });
      }
    });

    // -------------------------------------------------------------
    // RULE 4: Low or Negative Savings Rate
    // -------------------------------------------------------------
    if (totalIncome > 0 && savingsRate < 15 && totalExpenses > 0) {
      recommendations.push({
        id: 'low-savings-rate',
        type: 'savings_tip',
        title: savingsRate <= 0 ? 'Deficit Spending Alert' : 'Boost Your Savings Buffer',
        message:
          savingsRate <= 0
            ? `Your current expenses (${currency}${totalExpenses}) equal or exceed your income (${currency}${totalIncome}). Look for non-essential subscriptions or dine-out costs to trim immediately.`
            : `You are saving ${savingsRate}% of your income. The 50/30/20 rule suggests saving at least 20%. Try the 'pay yourself first' rule by auto-saving on day 1!`,
        category: 'Savings',
        severity: savingsRate <= 0 ? 'alert' : 'info',
        iconType: 'piggy-bank',
      });
    }

    // -------------------------------------------------------------
    // RULE 5: High Unnecessary Spending (>30%)
    // -------------------------------------------------------------
    const unnecessaryExpenses = currentExpenses.filter((e) => e.is_necessary === false);
    const unnecessaryTotal = calculateTotalExpenses(unnecessaryExpenses);
    if (totalExpenses > 0) {
      const unnecessaryPct = roundToTwo((unnecessaryTotal / totalExpenses) * 100);
      if (unnecessaryPct >= 30) {
        recommendations.push({
          id: 'high-unnecessary-spending',
          type: 'habit_tip',
          title: `Non-Essential Spending is ${unnecessaryPct}%`,
          message: `A significant portion (${currency}${unnecessaryTotal}) is logged as non-essential wants. Applying a 48-hour cooling-off rule before purchasing non-essentials can reduce impulse buys.`,
          category: 'Personal',
          severity: 'warning',
          iconType: 'shopping-bag',
        });
      }
    }

    // -------------------------------------------------------------
    // RULE 6: Subscriptions Review
    // -------------------------------------------------------------
    const subscriptionTotal = categoryTotals['Subscriptions'] || 0;
    if (subscriptionTotal > 0 && (subscriptionTotal >= 500 || (totalExpenses > 0 && (subscriptionTotal / totalExpenses) >= 0.12))) {
      recommendations.push({
        id: 'subscription-audit',
        type: 'subscription_tip',
        title: 'Review Active Subscriptions',
        message: `You spent ${currency}${subscriptionTotal} on recurring subscriptions. Regularly audit student plans, streaming, and gaming passes to cancel dormant ones.`,
        category: 'Subscriptions',
        severity: 'info',
        iconType: 'refresh-cw',
      });
    }

    // -------------------------------------------------------------
    // RULE 7: Positive Behavior & Progress
    // -------------------------------------------------------------
    const prevMonthTotal = calculateTotalExpenses(prevExpenses);
    if (prevMonthTotal > 0 && totalExpenses > 0 && totalExpenses < prevMonthTotal) {
      const decreasePct = roundToTwo(((prevMonthTotal - totalExpenses) / prevMonthTotal) * 100);
      recommendations.push({
        id: 'positive-spending-reduction',
        type: 'positive_reinforcement',
        title: 'Spending Down Month-Over-Month! 🎉',
        message: `Outstanding control! You have spent ${decreasePct}% less so far compared to this point last month. Keep tracking consistently!`,
        category: 'Habits',
        severity: 'success',
        iconType: 'trending-down',
      });
    } else if (savingsRate >= 35) {
      recommendations.push({
        id: 'stellar-savings-rate',
        type: 'positive_reinforcement',
        title: 'Super Saver Status! ⭐',
        message: `You are maintaining a strong ${savingsRate}% savings rate this month! You are well on your way to building financial independence.`,
        category: 'Savings',
        severity: 'success',
        iconType: 'award',
      });
    }

    // If few expenses or no triggers hit, give helpful foundational tips
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'foundational-tracking',
        type: 'general_tip',
        title: 'Track Daily for Maximum Clarity',
        message:
          'Log your daily snacks, transit fares, and online treats immediately after paying. Micro-expenses are usually where teenagers lose track of pocket money!',
        category: 'Habits',
        severity: 'info',
        iconType: 'check-circle',
      });
    }

    // -------------------------------------------------------------
    // STRUCTURED PERSONALIZED INSIGHTS
    // -------------------------------------------------------------
    // 1. Spending Insight
    let spendingInsight = 'Keep logging your expenses daily to reveal spending trends.';
    if (prevMonthTotal > 0 && totalExpenses > 0) {
      if (totalExpenses > prevMonthTotal) {
        const incPct = roundToTwo(((totalExpenses - prevMonthTotal) / prevMonthTotal) * 100);
        spendingInsight = `Your spending is currently ${incPct}% higher than the previous month (${currency}${totalExpenses} vs ${currency}${prevMonthTotal}).`;
      } else {
        const decPct = roundToTwo(((prevMonthTotal - totalExpenses) / prevMonthTotal) * 100);
        spendingInsight = `You spent ${decPct}% less this month than last month (${currency}${totalExpenses} vs ${currency}${prevMonthTotal}).`;
      }
    } else if (totalExpenses > 0) {
      spendingInsight = `You have spent ${currency}${totalExpenses} across ${currentExpenses.length} transaction(s) this month.`;
    }

    // 2. Budget Goal
    let topCategory = 'Entertainment';
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    const targetGoalAmount = Math.max(100, Math.round((topCategoryAmount * 0.85) / 50) * 50);
    const budgetGoal =
      topCategoryAmount > 0
        ? `Try keeping ${topCategory} spending below ${currency}${targetGoalAmount} next month (saving ~15%).`
        : `Set your first monthly budget in the Budgets tab to unlock automated spending caps.`;

    // 3. Saving Opportunity
    const monthlyTrim = unnecessaryTotal > 0 ? Math.min(unnecessaryTotal, 500) : 500;
    const yearlyPotential = roundToTwo(monthlyTrim * 12);
    const savingOpportunity = `Trimming unnecessary purchases by just ${currency}${monthlyTrim}/month puts ${currency}${yearlyPotential} back into your pocket every year!`;

    // 4. Category Insight
    const categoryInsight =
      topCategoryAmount > 0
        ? `${topCategory} is currently your largest expense category at ${currency}${topCategoryAmount} (${roundToTwo(
            (topCategoryAmount / (totalExpenses || 1)) * 100
          )}% of total).`
        : 'Add your first expense to see your biggest spending category.';

    return {
      recommendations,
      insights: {
        spendingInsight,
        budgetGoal,
        savingOpportunity,
        categoryInsight,
      },
    };
  }

  /**
   * Educational Financial Health Score
   */
  static async getFinancialHealth(userId) {
    const now = new Date();
    const currentRange = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);

    const [user, expenses, incomes, budgetData] = await Promise.all([
      UserModel.findById(userId),
      ExpenseModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      IncomeModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      BudgetService.getBudgetsWithStatus(userId, now.getMonth() + 1, now.getFullYear()),
    ]);

    const recordedIncome = calculateTotalIncome(incomes);
    const totalIncome = recordedIncome > 0 ? recordedIncome : (parseFloat(user?.monthly_income) || 0);
    const totalExpenses = calculateTotalExpenses(expenses);

    const health = calculateFinancialHealthScore({
      totalIncome,
      totalExpenses,
      budgets: budgetData.budgets,
      expenses,
    });

    return {
      ...health,
      totalIncome,
      totalExpenses,
      currency: user?.currency || '₹',
    };
  }
}

module.exports = RecommendationService;
