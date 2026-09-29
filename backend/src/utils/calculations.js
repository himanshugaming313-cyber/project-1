/**
 * Financial Calculation Utilities
 * Safe calculation helpers with zero-division safeguards
 */

const roundToTwo = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

const calculateTotalExpenses = (expenses = []) => {
  return roundToTwo(
    expenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  );
};

const calculateTotalIncome = (incomes = []) => {
  return roundToTwo(
    incomes.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  );
};

const calculateSavings = (income = 0, expenses = 0) => {
  return roundToTwo(Number(income) - Number(expenses));
};

const calculateSavingsRate = (income = 0, expenses = 0) => {
  const inc = Number(income);
  const exp = Number(expenses);
  if (!inc || inc <= 0) return 0;
  const rate = ((inc - exp) / inc) * 100;
  return roundToTwo(Math.max(-100, Math.min(100, rate)));
};

const calculateAverageDailyExpense = (totalExpenses = 0, days = 30) => {
  const safeDays = Math.max(1, Number(days) || 1);
  return roundToTwo(Number(totalExpenses) / safeDays);
};

const calculateCategoryPercentage = (categoryAmount = 0, totalExpenses = 0) => {
  const tot = Number(totalExpenses);
  if (!tot || tot <= 0) return 0;
  return roundToTwo((Number(categoryAmount) / tot) * 100);
};

const calculateBudgetUsage = (spent = 0, budgetAmount = 0) => {
  const b = Number(budgetAmount);
  if (!b || b <= 0) return 0;
  return roundToTwo((Number(spent) / b) * 100);
};

/**
 * Educational Financial Health Score (0 - 100)
 * Evaluates savings rate, budget adherence, necessary vs unnecessary spending, and consistency
 */
const calculateFinancialHealthScore = ({
  totalIncome = 0,
  totalExpenses = 0,
  budgets = [],
  expenses = [],
} = {}) => {
  let score = 0;
  const factors = [];

  const income = Number(totalIncome) || 0;
  const exp = Number(totalExpenses) || 0;

  // Factor 1: Savings Rate (Max 30 points)
  const savingsRate = calculateSavingsRate(income, exp);
  let savingsPoints = 0;
  if (savingsRate >= 30) {
    savingsPoints = 30;
    factors.push({
      title: 'Strong Savings Rate',
      points: 30,
      maxPoints: 30,
      status: 'excellent',
      detail: `You are saving ${savingsRate}% of your income, well above the recommended 20% benchmark.`,
    });
  } else if (savingsRate >= 15) {
    savingsPoints = 22;
    factors.push({
      title: 'Healthy Savings Rate',
      points: 22,
      maxPoints: 30,
      status: 'good',
      detail: `You are saving ${savingsRate}% of your income. Aim to push closer to 20-30% for a stronger safety net.`,
    });
  } else if (savingsRate > 0) {
    savingsPoints = 12;
    factors.push({
      title: 'Modest Savings',
      points: 12,
      maxPoints: 30,
      status: 'warning',
      detail: `Your savings rate is ${savingsRate}%. Setting aside even 10% more each month makes a massive difference.`,
    });
  } else {
    savingsPoints = 0;
    factors.push({
      title: 'Zero or Deficit Savings',
      points: 0,
      maxPoints: 30,
      status: 'alert',
      detail: `Your spending exceeds or equals your income. Look for flexible areas to trim back immediately.`,
    });
  }
  score += savingsPoints;

  // Factor 2: Budget Adherence (Max 25 points)
  let budgetPoints = 15; // default if no budgets defined yet
  if (budgets && budgets.length > 0) {
    const exceededCount = budgets.filter((b) => (b.spent || 0) > b.amount).length;
    const warningCount = budgets.filter(
      (b) => (b.spent || 0) >= b.amount * 0.8 && (b.spent || 0) <= b.amount
    ).length;

    if (exceededCount === 0 && warningCount === 0) {
      budgetPoints = 25;
      factors.push({
        title: 'Perfect Budget Adherence',
        points: 25,
        maxPoints: 25,
        status: 'excellent',
        detail: `All ${budgets.length} of your spending categories are comfortably within planned limits.`,
      });
    } else if (exceededCount === 0) {
      budgetPoints = 18;
      factors.push({
        title: 'Approaching Budget Limits',
        points: 18,
        maxPoints: 25,
        status: 'warning',
        detail: `${warningCount} budget(s) have reached over 80% usage. Monitor spending closely before month end.`,
      });
    } else {
      budgetPoints = Math.max(5, 25 - exceededCount * 8);
      factors.push({
        title: 'Budgets Exceeded',
        points: budgetPoints,
        maxPoints: 25,
        status: 'alert',
        detail: `${exceededCount} category budget(s) have been exceeded this cycle.`,
      });
    }
  } else {
    factors.push({
      title: 'Budgeting Setup',
      points: 15,
      maxPoints: 25,
      status: 'neutral',
      detail: 'Set category budgets to unlock the full 25 points for active budget management.',
    });
  }
  score += budgetPoints;

  // Factor 3: Necessary vs Unnecessary Spending Ratio (Max 25 points)
  let necessityPoints = 15;
  if (expenses.length > 0) {
    const unnecessaryTotal = expenses
      .filter((e) => e.is_necessary === false)
      .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    const unnecessaryRatio = exp > 0 ? (unnecessaryTotal / exp) * 100 : 0;

    if (unnecessaryRatio <= 25) {
      necessityPoints = 25;
      factors.push({
        title: 'Intentional Spending',
        points: 25,
        maxPoints: 25,
        status: 'excellent',
        detail: `Only ${roundToTwo(unnecessaryRatio)}% of spending is on non-essentials. Great discipline!`,
      });
    } else if (unnecessaryRatio <= 45) {
      necessityPoints = 18;
      factors.push({
        title: 'Balanced Wants vs Needs',
        points: 18,
        maxPoints: 25,
        status: 'good',
        detail: `Non-essential spending is at ${roundToTwo(unnecessaryRatio)}%, aligned with healthy lifestyle budgeting.`,
      });
    } else {
      necessityPoints = 8;
      factors.push({
        title: 'High Non-Essential Spending',
        points: 8,
        maxPoints: 25,
        status: 'warning',
        detail: `${roundToTwo(unnecessaryRatio)}% of your expenses are marked non-essential. Pruning impulse buys will help.`,
      });
    }
  } else {
    factors.push({
      title: 'Expense Discipline',
      points: 15,
      maxPoints: 25,
      status: 'neutral',
      detail: 'Keep logging expenses and tag essentials vs wants to gauge your spending discipline.',
    });
  }
  score += necessityPoints;

  // Factor 4: Spending Consistency & Expense Distribution (Max 20 points)
  let consistencyPoints = 15;
  if (expenses.length >= 5) {
    consistencyPoints = 20;
    factors.push({
      title: 'Active Financial Awareness',
      points: 20,
      maxPoints: 20,
      status: 'excellent',
      detail: 'You are consistently logging and tracking multiple transactions, developing great financial habits.',
    });
  } else if (expenses.length > 0) {
    consistencyPoints = 12;
    factors.push({
      title: 'Starting Out',
      points: 12,
      maxPoints: 20,
      status: 'neutral',
      detail: 'Log more regular transactions to get a deeper statistical view of your spending rhythm.',
    });
  } else {
    factors.push({
      title: 'Awaiting Transactions',
      points: 10,
      maxPoints: 20,
      status: 'neutral',
      detail: 'Add your first few expenses to activate spending pattern evaluation.',
    });
  }
  score += consistencyPoints;

  let grade = 'Fair';
  let color = 'text-amber-500';
  if (score >= 85) {
    grade = 'Excellent';
    color = 'text-emerald-500';
  } else if (score >= 70) {
    grade = 'Good';
    color = 'text-teal-500';
  } else if (score >= 50) {
    grade = 'Fair';
    color = 'text-amber-500';
  } else {
    grade = 'Needs Attention';
    color = 'text-rose-500';
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    grade,
    color,
    factors,
    disclaimer:
      'This is an educational budgeting indicator designed to encourage healthy money habits, NOT professional financial advice.',
  };
};

module.exports = {
  roundToTwo,
  calculateTotalExpenses,
  calculateTotalIncome,
  calculateSavings,
  calculateSavingsRate,
  calculateAverageDailyExpense,
  calculateCategoryPercentage,
  calculateBudgetUsage,
  calculateFinancialHealthScore,
};
