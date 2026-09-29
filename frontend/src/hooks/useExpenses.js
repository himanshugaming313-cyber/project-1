import { useState, useEffect, useCallback } from 'react';
import expenseService from '../services/expenseService';

export const useExpenses = (initialParams = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await expenseService.getExpenses(params);
      if (res.success) {
        setExpenses(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (data) => {
    const res = await expenseService.createExpense(data);
    await fetchExpenses();
    return res;
  };

  const editExpense = async (id, data) => {
    const res = await expenseService.updateExpense(id, data);
    await fetchExpenses();
    return res;
  };

  const removeExpense = async (id) => {
    const res = await expenseService.deleteExpense(id);
    await fetchExpenses();
    return res;
  };

  return {
    expenses,
    pagination,
    loading,
    error,
    params,
    setParams,
    fetchExpenses,
    addExpense,
    editExpense,
    removeExpense,
  };
};

export default useExpenses;
