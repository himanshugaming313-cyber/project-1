/**
 * Formats a numeric amount with the given currency symbol
 * @param {number|string} amount
 * @param {string} currency - e.g. '₹', '$', '€', '£'
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0;
  const formattedNumber = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `${currency}${formattedNumber}`;
};

export default formatCurrency;
