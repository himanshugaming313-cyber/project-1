import React from 'react';
import {
  Utensils,
  Bus,
  GraduationCap,
  Film,
  ShoppingBag,
  Tv,
  Gamepad2,
  HeartPulse,
  Receipt,
  Plane,
  User,
  HelpCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

const CATEGORY_ICONS = {
  Food: Utensils,
  Transport: Bus,
  Education: GraduationCap,
  Entertainment: Film,
  Shopping: ShoppingBag,
  Subscriptions: Tv,
  Gaming: Gamepad2,
  Health: HeartPulse,
  Bills: Receipt,
  Travel: Plane,
  Personal: User,
  Other: HelpCircle,
};

const CATEGORY_COLORS = {
  Food: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800/40',
  Transport: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
  Education: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  Entertainment: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800/40',
  Shopping: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 border-pink-200 dark:border-pink-800/40',
  Subscriptions: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40',
  Gaming: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-800/40',
  Health: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
  Bills: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  Travel: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/40',
  Personal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800/40',
  Other: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

export const ExpenseCard = ({
  expense,
  currency = '₹',
  onEdit,
  onDelete,
}) => {
  const Icon = CATEGORY_ICONS[expense.category] || HelpCircle;
  const colorClass = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-200 dark:hover:border-indigo-900/60 shadow-sm hover:shadow-md transition-all gap-4">
      {/* Left: Icon & Info */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className={`p-3 rounded-2xl border ${colorClass} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {expense.title}
            </h4>
            {expense.is_necessary ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Need
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Sparkles className="w-3 h-3" />
                Want
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {expense.category}
            </span>
            <span>•</span>
            <span>{formatDate(expense.expense_date)}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium">
              {expense.payment_method || 'Cash'}
            </span>
            {expense.description && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline italic text-slate-400 truncate max-w-[200px]">
                  "{expense.description}"
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Amount & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
        <div className="text-left sm:text-right">
          <p className="text-lg sm:text-xl font-extrabold font-display text-slate-900 dark:text-white">
            {formatCurrency(expense.amount, currency)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(expense)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Edit Expense"
              aria-label="Edit expense"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(expense)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Expense"
              aria-label="Delete expense"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
