import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  PlusCircle,
  Plus,
  ArrowRight,
  Target,
  Sparkles,
  PieChart,
  AlertTriangle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import analyticsService from '../services/analyticsService';
import expenseService from '../services/expenseService';
import incomeService from '../services/incomeService';
import budgetService from '../services/budgetService';
import recommendationService from '../services/recommendationService';
import { formatCurrency } from '../utils/formatCurrency';
import { getTodayDateInput } from '../utils/formatDate';

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Income Modal State
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    source: 'Pocket Money',
    amount: '',
    income_date: getTodayDateInput(),
    description: '',
  });
  const [incomeLoading, setIncomeLoading] = useState(false);

  // Delete Confirmation Modal State
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currency = user?.currency || '₹';

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, expRes, budgetRes, catRes, healthRes] = await Promise.all([
        analyticsService.getSummary(),
        expenseService.getExpenses({ page: 1, limit: 5 }),
        budgetService.getBudgetStatus(),
        analyticsService.getCategoryBreakdown(),
        recommendationService.getFinancialHealth(),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (expRes.success) setRecentExpenses(expRes.data);
      if (budgetRes.success) setBudgetStatus(budgetRes.data?.budgets || []);
      if (catRes.success) setTopCategories(catRes.data?.categories?.slice(0, 4) || []);
      if (healthRes.success) setHealthScore(healthRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleAddIncome = async (e) => {
    e.preventDefault();
    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) return;

    setIncomeLoading(true);
    try {
      const res = await incomeService.createIncome({
        ...incomeForm,
        amount: parseFloat(incomeForm.amount),
      });
      if (res.success) {
        setIsIncomeModalOpen(false);
        setIncomeForm({
          source: 'Pocket Money',
          amount: '',
          income_date: getTodayDateInput(),
          description: '',
        });
        await loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to add income:', err);
    } finally {
      setIncomeLoading(false);
    }
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setDeleteLoading(true);
    try {
      await expenseService.deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner message="Calculating your financial summary..." size="lg" />
      </div>
    );
  }

  const savingsRate = summary?.savingsRate || 0;
  const isDeficit = summary?.remaining < 0;

  // Active budget alerts (>= 80%)
  const budgetAlerts = budgetStatus.filter((b) => b.percentageUsed >= 80);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            Hello, {user?.name || 'Friend'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your financial snapshot for this month.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            + Add Income
          </button>
          <Link
            to="/add-expense"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Financial Health Banner (if available) */}
      {healthScore && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-lg border border-indigo-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/20">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Financial Health Score
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold font-display">
                {healthScore.grade} • {healthScore.score} / 100
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
                {healthScore.factors?.[0]?.detail ||
                  'Keep tracking your expenses and maintaining your budget caps to increase your score.'}
              </p>
            </div>

            <Link
              to="/recommendations"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all self-start sm:self-center shrink-0"
            >
              View Full Health Breakdown
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary?.totalIncome || 0, currency)}
          subtitle={
            summary?.recordedIncome > 0
              ? `${currency}${summary.recordedIncome} recorded entries`
              : 'Based on baseline income'
          }
          icon={Wallet}
          variant="emerald"
        />

        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary?.totalExpenses || 0, currency)}
          subtitle={`${summary?.transactionCount || 0} transactions this month`}
          icon={CreditCard}
          variant="rose"
        />

        <StatCard
          title="Remaining Funds"
          value={formatCurrency(summary?.remaining || 0, currency)}
          subtitle={isDeficit ? 'Deficit - spending exceeds income' : 'Available buffer'}
          icon={PiggyBank}
          variant={isDeficit ? 'rose' : 'indigo'}
          badge={isDeficit ? 'Deficit' : 'Safe Buffer'}
          badgeType={isDeficit ? 'negative' : 'positive'}
        />

        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          subtitle={
            summary?.monthOverMonthChange !== 0
              ? `${summary?.monthOverMonthChange > 0 ? '+' : ''}${summary?.monthOverMonthChange}% spending vs last mo.`
              : 'Benchmark goal: 20%'
          }
          icon={TrendingUp}
          variant={savingsRate >= 20 ? 'emerald' : savingsRate > 0 ? 'amber' : 'rose'}
          badge={savingsRate >= 20 ? 'Great' : savingsRate > 0 ? 'Moderate' : 'Low'}
          badgeType={savingsRate >= 20 ? 'positive' : savingsRate > 0 ? 'warning' : 'negative'}
        />
      </div>

      {/* Budget Alerts Banner (if any category is >= 80%) */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Budget Limit Notice: {budgetAlerts.length} Category Alert(s)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                {budgetAlerts.map((b) => `${b.category} (${b.percentageUsed.toFixed(0)}%)`).join(', ')}
              </p>
            </div>
          </div>
          <Link
            to="/budgets"
            className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
          >
            Review Budgets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Middle Grid: Top Categories & Quick Budget Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Spending Categories */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Top Spending
              </h3>
              <Link
                to="/analytics"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Analytics →
              </Link>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No expense categories logged yet this month.
              </p>
            ) : (
              <div className="space-y-3.5">
                {topCategories.map((item, idx) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">
                        {idx + 1}. {item.category}
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {formatCurrency(item.total, currency)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/analytics"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between hover:underline"
            >
              <span>Explore full Recharts breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Expenses List (2 Cols on lg) */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Recent Expenses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your most recent purchases
                </p>
              </div>
              <Link
                to="/expenses"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All →
              </Link>
            </div>

            {recentExpenses.length === 0 ? (
              <EmptyState
                title="No expenses logged yet"
                description="Start recording your campus snacks, transit, or shopping to see your summary."
                actionLabel="Add First Expense"
                onAction={() => (window.location.href = '/add-expense')}
              />
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((exp) => (
                  <ExpenseCard
                    key={exp.id}
                    expense={exp}
                    currency={currency}
                    onDelete={(item) => setExpenseToDelete(item)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/add-expense"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Log New Expense
            </Link>
            <Link
              to="/expenses"
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Manage & Filter Expenses ({summary?.transactionCount || 0})
            </Link>
          </div>
        </div>
      </div>

      {/* Add Income Modal */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Add Income / Allowance"
      >
        <form onSubmit={handleAddIncome} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Income Source *
            </label>
            <select
              value={incomeForm.source}
              onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Pocket Money">Pocket Money / Allowance</option>
              <option value="Part-time Job">Part-time Job</option>
              <option value="Freelancing">Freelancing / Gig</option>
              <option value="Gift">Gift</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="e.g. 5000"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Date Received *
            </label>
            <input
              type="date"
              required
              value={incomeForm.income_date}
              onChange={(e) => setIncomeForm({ ...incomeForm, income_date: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Allowance from mom, Birthday money"
              value={incomeForm.description}
              onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={incomeLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {incomeLoading ? 'Adding...' : 'Save Income'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Expense Confirmation Modal */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Delete Expense?"
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
              onClick={confirmDeleteExpense}
              disabled={deleteLoading}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Expense'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
