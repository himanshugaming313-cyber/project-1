import React, { useState, useEffect, useCallback } from 'react';
import { Target, PlusCircle, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import BudgetCard from '../components/BudgetCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import budgetService from '../services/budgetService';
import { formatCurrency } from '../utils/formatCurrency';

const CATEGORIES = [
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

export const Budgets = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set / Edit Budget Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState(null);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formCategory, setFormCategory] = useState('Food');
  const [formAmount, setFormAmount] = useState('');
  const [error, setError] = useState('');

  const fetchBudgetStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await budgetService.getBudgetStatus({
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.success) {
        setBudgetData(res.data);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetStatus();
  }, [fetchBudgetStatus]);

  const handleOpenAddModal = (editItem = null) => {
    setError('');
    if (editItem) {
      setBudgetToEdit(editItem);
      setFormCategory(editItem.category);
      setFormAmount(editItem.amount);
    } else {
      setBudgetToEdit(null);
      setFormCategory('Food');
      setFormAmount('');
    }
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const res = await budgetService.createBudget({
        category: formCategory,
        amount: amt,
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.success) {
        setIsModalOpen(false);
        await fetchBudgetStatus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setActionLoading(true);
    try {
      const res = await budgetService.deleteBudget(budgetToDelete.id);
      if (res.success) {
        setBudgetToDelete(null);
        await fetchBudgetStatus();
      }
    } catch (err) {
      console.error('Failed to delete budget:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const overallPct = budgetData?.overallPercentage || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Target className="w-7 h-7 text-indigo-500" />
            Category Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set smart spending limits for individual categories and get notified when you reach 80% or 100%.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Month & Year Selectors */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <Calendar className="w-4 h-4 text-slate-400 ml-1.5" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-800 dark:text-white focus:outline-none pr-1"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="dark:bg-slate-900">
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-slate-800 dark:text-white focus:outline-none pr-1"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Set Budget
          </button>
        </div>
      </div>

      {/* Overall Month Budget Card */}
      {budgetData && budgetData.totalBudgeted > 0 && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-100/50 dark:to-slate-900/50 border border-indigo-200/80 dark:border-indigo-900/50 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Overall Budget Health ({months.find((m) => m.value === selectedMonth)?.label} {selectedYear})
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                {formatCurrency(budgetData.totalSpent, currency)} spent of {formatCurrency(budgetData.totalBudgeted, currency)} cap
              </h3>
            </div>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                overallPct >= 100
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400'
                  : overallPct >= 80
                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
              }`}
            >
              {overallPct.toFixed(1)}% Total Used
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPct >= 100
                  ? 'bg-rose-500'
                  : overallPct >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, overallPct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      {loading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading monthly category budgets..." />
        </div>
      ) : !budgetData || budgetData.budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No category budgets set for this month"
          description="Create budgets for food, entertainment, transit, or shopping to stay in control of your cash."
          actionLabel="Create First Budget"
          onAction={() => handleOpenAddModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetData.budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              currency={currency}
              onEdit={(item) => handleOpenAddModal(item)}
              onDelete={(item) => setBudgetToDelete(item)}
            />
          ))}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={budgetToEdit ? 'Edit Budget Cap' : 'Set Category Budget'}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Category *
            </label>
            <select
              value={formCategory}
              disabled={!!budgetToEdit}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Limit ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                required
                placeholder="e.g. 2500"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Target cycle: <strong className="text-slate-900 dark:text-white">{months.find((m) => m.value === selectedMonth)?.label} {selectedYear}</strong>
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : budgetToEdit ? 'Update Limit' : 'Set Budget'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Budget Modal */}
      <Modal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        title="Delete Budget?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove the budget cap for{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {budgetToDelete?.category}
            </span>
            ? Your expense history for this category will remain intact.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setBudgetToDelete(null)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteBudget}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? 'Deleting...' : 'Delete Budget'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Budgets;
