/**
 * Format date string into human-readable date format (e.g., "Sep 28, 2026")
 * @param {string|Date} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date into short format (e.g., "Sep 28")
 */
export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Today's date formatted as YYYY-MM-DD for form input values
 */
export const getTodayDateInput = () => {
  return new Date().toISOString().slice(0, 10);
};

export default formatDate;
