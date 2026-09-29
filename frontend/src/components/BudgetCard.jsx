import React from 'react';
import { AlertTriangle, CheckCircle, Flame, Trash2, Edit2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

export const BudgetCard = ({
  budget,
  currency = '₹',
  onEdit,
  onDelete,
}) => {
  const percentage = Math.min(100, Math.max(0, budget.percentageUsed || 0));
  const isExceeded = (budget.percentageUsed || 0) >= 100;
  const isWarning = (budget.percentageUsed || 0) >= 80 && !isExceeded;

  let barColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
  let badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  let statusText = 'On Track';
  let StatusIcon = CheckCircle;

  if (isExceeded) {
    barColor = 'bg-gradient-to-r from-rose-500 to-red-600 animate-pulse';
    badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    statusText = 'Budget Exceeded!';
    StatusIcon = Flame;
  } else if (isWarning) {
    barColor = 'bg-gradient-to-r from-amber-400 to-orange-500';
    badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    statusText = 'Over 80% Used';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            {budget.category}
          </h4>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Monthly Spending Cap
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusText}
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              title="Edit Budget"
              aria-label="Edit budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(budget)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete Budget"
              aria-label="Delete budget"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400">
            {budget.percentageUsed ? budget.percentageUsed.toFixed(1) : '0'}% Used
          </span>
          <span className="text-slate-900 dark:text-white">
            {formatCurrency(budget.spent || 0, currency)} / {formatCurrency(budget.amount, currency)}
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
            Remaining
          </span>
          <span className={`font-bold text-sm ${budget.remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {formatCurrency(budget.remaining || 0, currency)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
            Budget Target
          </span>
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            {formatCurrency(budget.amount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
