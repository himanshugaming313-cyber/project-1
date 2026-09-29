import { useState, useEffect, useCallback } from 'react';
import budgetService from '../services/budgetService';

export const useBudget = (month, year) => {
  const [budgetData, setBudgetData] = useState({
    month: month || new Date().getMonth() + 1,
    year: year || new Date().getFullYear(),
    totalBudgeted: 0,
    totalSpent: 0,
    overallPercentage: 0,
    budgets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await budgetService.getBudgetStatus({ month, year });
      if (res.success) {
        setBudgetData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchBudgetStatus();
  }, [fetchBudgetStatus]);

  const saveBudget = async (data) => {
    const res = await budgetService.createBudget(data);
    await fetchBudgetStatus();
    return res;
  };

  const removeBudget = async (id) => {
    const res = await budgetService.deleteBudget(id);
    await fetchBudgetStatus();
    return res;
  };

  return {
    budgetData,
    loading,
    error,
    fetchBudgetStatus,
    saveBudget,
    removeBudget,
  };
};

export default useBudget;
