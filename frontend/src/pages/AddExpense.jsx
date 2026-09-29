import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ExpenseForm from '../components/ExpenseForm';
import expenseService from '../services/expenseService';

export const AddExpense = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await expenseService.createExpense(formData);
      if (res.success) {
        navigate('/expenses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense. Please check input values.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">
              Record an Expense
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Log a new transaction to stay on top of your monthly budget.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <ExpenseForm
          currency={currency}
          loading={loading}
          onSubmit={handleCreate}
          onCancel={() => navigate('/expenses')}
        />

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            Tip: Tagging purchases as <span className="font-semibold text-slate-700 dark:text-slate-300">Needs</span> vs{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Wants</span> helps calculate your personalized Saving Opportunities!
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
