import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo',
  badge,
  badgeType = 'neutral',
}) => {
  const variantStyles = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/40',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/40',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
    },
    sky: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-900/40',
    },
  };

  const badgeStyles = {
    positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    negative: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const currentVariant = variantStyles[variant] || variantStyles.indigo;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
            {value}
          </h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${currentVariant.bg} ${currentVariant.text} border ${currentVariant.border} shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {subtitle}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeType] || badgeStyles.neutral}`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
