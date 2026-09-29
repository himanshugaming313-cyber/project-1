const ExpenseModel = require('../models/expenseModel');
const IncomeModel = require('../models/incomeModel');
const UserModel = require('../models/userModel');
const {
  roundToTwo,
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateSavings,
  calculateSavingsRate,
  calculateAverageDailyExpense,
  calculateCategoryPercentage,
} = require('../utils/calculations');

class AnalyticsService {
  /**
   * Helper to format Date into YYYY-MM-DD
   */
  static toDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to get start and end date for a month
   */
  static getMonthRange(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }

  /**
   * Financial Summary for Dashboard
   */
  static async getSummary(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Current month range
    const currentRange = this.getMonthRange(currentYear, currentMonth);

    // Previous month range
    const prevDate = new Date(currentYear, currentMonth - 2, 1);
    const prevRange = this.getMonthRange(prevDate.getFullYear(), prevDate.getMonth() + 1);

    const [user, currentExpenses, currentIncomes, prevExpenses] = await Promise.all([
      UserModel.findById(userId),
      ExpenseModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      IncomeModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      ExpenseModel.getByDateRange(userId, prevRange.startDate, prevRange.endDate),
    ]);

    const recordedIncome = calculateTotalIncome(currentIncomes);
    // If no recorded transactions yet this month, fallback to user's registered baseline monthly_income
    const totalIncome = recordedIncome > 0 ? recordedIncome : (parseFloat(user?.monthly_income) || 0);

    const totalExpenses = calculateTotalExpenses(currentExpenses);
    const remaining = calculateSavings(totalIncome, totalExpenses);
    const savings = remaining;
    const savingsRate = calculateSavingsRate(totalIncome, totalExpenses);

    const prevMonthExpenses = calculateTotalExpenses(prevExpenses);
    let monthOverMonthChange = 0;
    if (prevMonthExpenses > 0) {
      monthOverMonthChange = roundToTwo(
        ((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
      );
    }

    return {
      currency: user?.currency || '₹',
      totalIncome,
      recordedIncome,
      baselineIncome: parseFloat(user?.monthly_income) || 0,
      totalExpenses,
      remaining,
      savings,
      savingsRate,
      transactionCount: currentExpenses.length,
      previousMonthExpenses: prevMonthExpenses,
      monthOverMonthChange,
      month: currentMonth,
      year: currentYear,
    };
  }

  /**
   * Spending by Category Breakdown
   */
  static async getCategories(userId, startDate, endDate) {
    let sDate = startDate;
    let eDate = endDate;

    if (!sDate || !eDate) {
      const now = new Date();
      const currentRange = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);
      sDate = currentRange.startDate;
      eDate = currentRange.endDate;
    }

    const expenses = await ExpenseModel.getByDateRange(userId, sDate, eDate);
    const totalExpenses = calculateTotalExpenses(expenses);

    const categoryMap = {};
    expenses.forEach((item) => {
      const cat = item.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, total: 0, count: 0 };
      }
      categoryMap[cat].total += parseFloat(item.amount) || 0;
      categoryMap[cat].count += 1;
    });

    const categoryList = Object.values(categoryMap).map((cat) => ({
      category: cat.category,
      total: roundToTwo(cat.total),
      count: cat.count,
      percentage: calculateCategoryPercentage(cat.total, totalExpenses),
    }));

    categoryList.sort((a, b) => b.total - a.total);

    return {
      startDate: sDate,
      endDate: eDate,
      totalExpenses,
      categories: categoryList,
    };
  }

  /**
   * Monthly trend for past 6 months
   */
  static async getMonthlyTrend(userId) {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      });
    }

    const firstMonthRange = this.getMonthRange(months[0].year, months[0].month);
    const lastMonthRange = this.getMonthRange(months[months.length - 1].year, months[months.length - 1].month);

    const [allExpenses, allIncomes, user] = await Promise.all([
      ExpenseModel.getByDateRange(userId, firstMonthRange.startDate, lastMonthRange.endDate),
      IncomeModel.getByDateRange(userId, firstMonthRange.startDate, lastMonthRange.endDate),
      UserModel.findById(userId),
    ]);

    const baseline = parseFloat(user?.monthly_income) || 0;

    const trend = months.map((m) => {
      const monthPrefix = `${m.year}-${String(m.month).padStart(2, '0')}`;
      
      const mExpenses = allExpenses.filter((e) => e.expense_date.startsWith(monthPrefix));
      const mIncomes = allIncomes.filter((i) => i.income_date.startsWith(monthPrefix));

      const exp = calculateTotalExpenses(mExpenses);
      const inc = mIncomes.length > 0 ? calculateTotalIncome(mIncomes) : baseline;
      const sav = roundToTwo(inc - exp);

      return {
        month: m.label,
        year: m.year,
        monthNumber: m.month,
        expenses: exp,
        income: inc,
        savings: sav,
      };
    });

    return trend;
  }

  /**
   * Daily spending over the current month or specified period
   */
  static async getDailySpending(userId, startDate, endDate) {
    let sDate = startDate;
    let eDate = endDate;

    if (!sDate || !eDate) {
      const now = new Date();
      const currentRange = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);
      sDate = currentRange.startDate;
      eDate = currentRange.endDate;
    }

    const expenses = await ExpenseModel.getByDateRange(userId, sDate, eDate);

    // Build map of date -> amount
    const dailyMap = {};
    expenses.forEach((item) => {
      const dateKey = item.expense_date;
      dailyMap[dateKey] = (dailyMap[dateKey] || 0) + (parseFloat(item.amount) || 0);
    });

    // Generate consecutive dates between sDate and eDate
    const result = [];
    const curr = new Date(sDate);
    const end = new Date(eDate);

    while (curr <= end) {
      const dStr = this.toDateString(curr);
      const displayLabel = curr.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      result.push({
        date: dStr,
        label: displayLabel,
        amount: roundToTwo(dailyMap[dStr] || 0),
      });
      curr.setDate(curr.getDate() + 1);
    }

    return result;
  }

  /**
   * Comparison for presets: today, this_week, this_month, last_month, custom
   */
  static async getComparison(userId, rangeKey = 'this_month', customStart, customEnd) {
    const now = new Date();
    let startDate;
    let endDate = this.toDateString(now);

    switch (rangeKey) {
      case 'today':
        startDate = endDate;
        break;
      case 'this_week': {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startDate = this.toDateString(startOfWeek);
        break;
      }
      case 'last_month': {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const pRange = this.getMonthRange(prev.getFullYear(), prev.getMonth() + 1);
        startDate = pRange.startDate;
        endDate = pRange.endDate;
        break;
      }
      case 'custom':
        startDate = customStart || this.toDateString(new Date(now.getFullYear(), now.getMonth(), 1));
        endDate = customEnd || this.toDateString(now);
        break;
      case 'this_month':
      default: {
        const mRange = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);
        startDate = mRange.startDate;
        endDate = mRange.endDate;
        break;
      }
    }

    const [expenses, incomes] = await Promise.all([
      ExpenseModel.getByDateRange(userId, startDate, endDate),
      IncomeModel.getByDateRange(userId, startDate, endDate),
    ]);

    const totalExpenses = calculateTotalExpenses(expenses);
    const totalIncome = calculateTotalIncome(incomes);
    const savings = calculateSavings(totalIncome, totalExpenses);

    return {
      rangeKey,
      startDate,
      endDate,
      totalExpenses,
      totalIncome,
      savings,
      transactionCount: expenses.length,
    };
  }

  /**
   * Deep spending patterns analysis
   */
  static async getSpendingPatterns(userId) {
    const now = new Date();
    const currentRange = this.getMonthRange(now.getFullYear(), now.getMonth() + 1);

    const [expenses, user] = await Promise.all([
      ExpenseModel.getByDateRange(userId, currentRange.startDate, currentRange.endDate),
      UserModel.findById(userId),
    ]);

    const totalSpending = calculateTotalExpenses(expenses);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = Math.max(1, now.getDate());

    const averageDailySpending = calculateAverageDailyExpense(totalSpending, daysPassed);
    const averageWeeklySpending = roundToTwo(averageDailySpending * 7);

    // Highest spending day
    const dayTotals = {};
    expenses.forEach((e) => {
      dayTotals[e.expense_date] = (dayTotals[e.expense_date] || 0) + (parseFloat(e.amount) || 0);
    });

    let highestSpendingDay = null;
    let highestDayAmount = 0;
    Object.entries(dayTotals).forEach(([day, amt]) => {
      if (amt > highestDayAmount) {
        highestDayAmount = amt;
        highestSpendingDay = day;
      }
    });

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
    });

    let highestCategory = 'None';
    let highestCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > highestCategoryAmount) {
        highestCategoryAmount = amt;
        highestCategory = cat;
      }
    });

    // Necessary vs Unnecessary
    const necessaryAmount = calculateTotalExpenses(expenses.filter((e) => e.is_necessary !== false));
    const unnecessaryAmount = calculateTotalExpenses(expenses.filter((e) => e.is_necessary === false));

    const necessaryPercentage = calculateCategoryPercentage(necessaryAmount, totalSpending);
    const unnecessaryPercentage = calculateCategoryPercentage(unnecessaryAmount, totalSpending);

    // Payment methods
    const paymentMethods = {};
    expenses.forEach((e) => {
      const pm = e.payment_method || 'Other';
      paymentMethods[pm] = (paymentMethods[pm] || 0) + (parseFloat(e.amount) || 0);
    });

    return {
      currency: user?.currency || '₹',
      totalSpending,
      transactionCount: expenses.length,
      averageDailySpending,
      averageWeeklySpending,
      highestSpendingDay: highestSpendingDay ? { date: highestSpendingDay, amount: roundToTwo(highestDayAmount) } : null,
      highestCategory: {
        category: highestCategory,
        amount: roundToTwo(highestCategoryAmount),
        percentage: calculateCategoryPercentage(highestCategoryAmount, totalSpending),
      },
      necessityBreakdown: {
        necessaryAmount,
        necessaryPercentage,
        unnecessaryAmount,
        unnecessaryPercentage,
      },
      paymentMethods: Object.entries(paymentMethods).map(([method, amount]) => ({
        method,
        amount: roundToTwo(amount),
        percentage: calculateCategoryPercentage(amount, totalSpending),
      })),
    };
  }
}

module.exports = AnalyticsService;
