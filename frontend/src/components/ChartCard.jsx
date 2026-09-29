import React from 'react';

export const ChartCard = ({ title, subtitle, action, children, minHeight = 'min-h-[320px]' }) => {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className={`w-full ${minHeight} flex items-center justify-center`}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
