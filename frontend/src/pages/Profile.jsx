import React, { useState } from 'react';
import { User, Mail, DollarSign, Calendar, Save, AlertCircle, CheckCircle2, Lock, LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

const CURRENCIES = [
  { symbol: '₹', label: '₹ (INR - Indian Rupee)' },
  { symbol: '$', label: '$ (USD - US Dollar)' },
  { symbol: '€', label: '€ (EUR - Euro)' },
  { symbol: '£', label: '£ (GBP - British Pound)' },
  { symbol: '¥', label: '¥ (JPY - Japanese Yen)' },
  { symbol: 'C$', label: 'C$ (CAD - Canadian Dollar)' },
  { symbol: 'A$', label: 'A$ (AUD - Australian Dollar)' },
];

export const Profile = () => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthly_income || '');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const updates = {
        name,
        currency,
        monthly_income: parseFloat(monthlyIncome) || 0,
      };

      if (newPassword && newPassword.trim().length >= 6) {
        updates.password = newPassword.trim();
      } else if (newPassword && newPassword.trim().length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const res = await updateProfile(updates);
      if (res.success) {
        setSuccessMsg('Profile updated successfully!');
        setNewPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-indigo-500" />
          Account Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your personal details, preferred currency, and baseline allowance.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-extrabold font-display shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {user?.name || 'Account Holder'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5" />
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
        </div>

        <div className="text-center sm:text-right p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Baseline Monthly Income
          </span>
          <span className="text-xl font-extrabold font-display text-slate-900 dark:text-white">
            {formatCurrency(user?.monthly_income || 0, user?.currency || '₹')}
          </span>
        </div>
      </div>

      {/* Feedback Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-6">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Email is tied to your account authentication and cannot be edited.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Baseline Monthly Income / Allowance ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Change Password (leave empty to keep current)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
