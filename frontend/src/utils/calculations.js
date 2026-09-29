/**
 * Client-side calculation helpers
 */

export const calculateSavings = (income = 0, expenses = 0) => {
  return Number(income) - Number(expenses);
};

export const calculateSavingsRate = (income = 0, expenses = 0) => {
  const inc = Number(income);
  const exp = Number(expenses);
  if (!inc || inc <= 0) return 0;
  return Math.round((((inc - exp) / inc) * 100) * 10) / 10;
};

export const calculatePercentage = (part = 0, total = 0) => {
  const tot = Number(total);
  if (!tot || tot <= 0) return 0;
  return Math.round(((Number(part) / tot) * 100) * 10) / 10;
};
