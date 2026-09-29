import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { getTodayDateInput } from '../utils/formatDate';

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

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const ExpenseForm = ({
  initialData = null,
  currency = '₹',
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    payment_method: 'UPI',
    expense_date: getTodayDateInput(),
    is_necessary: true,
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'Food',
        payment_method: initialData.payment_method || 'UPI',
        expense_date: initialData.expense_date
          ? String(initialData.expense_date).slice(0, 10)
          : getTodayDateInput(),
        is_necessary: initialData.is_necessary !== undefined ? initialData.is_necessary : true,
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Expense title is required';
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.expense_date) {
      newErrors.expense_date = 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Expense Title *
        </label>
        <input
          type="text"
          placeholder="e.g. Cinema Tickets, Campus Lunch, Coding Book"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border ${
            errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
          } text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Amount & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Amount ({currency}) *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">
              {currency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border ${
                errors.amount ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
              } text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Method & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Date *
          </label>
          <input
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Need vs Want (is_necessary) Toggle */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
          Expense Type (Need vs Want)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_necessary: true })}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-sm font-semibold ${
              formData.is_necessary
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Essential Need
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_necessary: false })}
            className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-sm font-semibold ${
              !formData.is_necessary
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Non-Essential Want
          </button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
          Marking items as Needs vs Wants powers your personal financial health score and saving opportunities!
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
          Description / Note (Optional)
        </label>
        <textarea
          rows="2"
          placeholder="Any extra context or reminders about this expense..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {initialData ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Save Expense'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
