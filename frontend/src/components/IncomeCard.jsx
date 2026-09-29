import React from 'react';
import { ArrowDownLeft, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

export const IncomeCard = ({ income, currency = '₹', onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shrink-0">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {income.source}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDate(income.income_date)} {income.description ? `• ${income.description}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-base sm:text-lg font-extrabold font-display text-emerald-600 dark:text-emerald-400">
          +{formatCurrency(income.amount, currency)}
        </span>
        {onDelete && (
          <button
            onClick={() => onDelete(income)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Income Entry"
            aria-label="Delete income"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default IncomeCard;
