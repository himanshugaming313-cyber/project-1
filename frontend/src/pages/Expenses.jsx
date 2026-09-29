import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import expenseService from '../services/expenseService';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Subscriptions',
  'Gaming',
  'Health',
  'Bills',
  'Travel',
  'Personal',
  'Other',
];

const PAYMENT_METHODS = [
  'All',
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const Expenses = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [necessity, setNecessity] = useState('All');
  const [sortBy, setSortBy] = useState('expense_date');
  const [order, setOrder] = useState('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        payment_method: paymentMethod !== 'All' ? paymentMethod : undefined,
        is_necessary: necessity === 'All' ? undefined : necessity === 'true',
        sortBy,
        order,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await expenseService.getExpenses(params);
      if (res.success) {
        setExpenses(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, paymentMethod, necessity, sortBy, order, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenses(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchExpenses]);

  const handleCreateExpense = async (formData) => {
    setActionLoading(true);
    try {
      const res = await expenseService.createExpense(formData);
      if (res.success) {
        setIsAddModalOpen(false);
        await fetchExpenses(1);
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateExpense = async (formData) => {
    if (!expenseToEdit) return;
    setActionLoading(true);
    try {
      const res = await expenseService.updateExpense(expenseToEdit.id, formData);
      if (res.success) {
        setExpenseToEdit(null);
        await fetchExpenses(pagination.page);
      }
    } catch (err) {
      console.error('Failed to update expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setActionLoading(true);
    try {
      const res = await expenseService.deleteExpense(expenseToDelete.id);
      if (res.success) {
        setExpenseToDelete(null);
        await fetchExpenses(pagination.page);
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setPaymentMethod('All');
    setNecessity('All');
    setSortBy('expense_date');
    setOrder('desc');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-500" />
            Expenses Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {pagination.total} transaction(s) recorded in your account
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          + Add New Expense
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        {/* Top Row: Search & Reset */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search expenses by title or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={resetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Need vs Want */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Need vs Want
            </label>
            <select
              value={necessity}
              onChange={(e) => setNecessity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="All">All Types</option>
              <option value="true">Needs Only</option>
              <option value="false">Wants Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}_${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('_');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="expense_date_desc">Date (Newest first)</option>
              <option value="expense_date_asc">Date (Oldest first)</option>
              <option value="amount_desc">Amount (Highest first)</option>
              <option value="amount_asc">Amount (Lowest first)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading your expenses..." />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses match your filters"
          description="Try changing your search terms or date filter, or record your next expense."
          actionLabel="Add Expense"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currency={currency}
              onEdit={(exp) => setExpenseToEdit(exp)}
              onDelete={(exp) => setExpenseToDelete(exp)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchExpenses(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => fetchExpenses(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          currency={currency}
          loading={actionLoading}
          onSubmit={handleCreateExpense}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={!!expenseToEdit}
        onClose={() => setExpenseToEdit(null)}
        title="Edit Expense"
      >
        <ExpenseForm
          initialData={expenseToEdit}
          currency={currency}
          loading={actionLoading}
          onSubmit={handleUpdateExpense}
          onCancel={() => setExpenseToEdit(null)}
        />
      </Modal>

      {/* Delete Expense Modal */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense Confirmation"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              "{expenseToDelete?.title}" ({formatCurrency(expenseToDelete?.amount || 0, currency)})
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setExpenseToDelete(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteExpense}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Expenses;
