import React from 'react';
import {
  PieChart,
  AlertTriangle,
  Clock,
  PiggyBank,
  ShoppingBag,
  RefreshCw,
  TrendingDown,
  Award,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';

const ICON_MAP = {
  'pie-chart': PieChart,
  'alert-triangle': AlertTriangle,
  'clock': Clock,
  'piggy-bank': PiggyBank,
  'shopping-bag': ShoppingBag,
  'refresh-cw': RefreshCw,
  'trending-down': TrendingDown,
  'award': Award,
  'check-circle': CheckCircle,
  'lightbulb': Lightbulb,
};

export const RecommendationCard = ({ recommendation }) => {
  const Icon = ICON_MAP[recommendation.iconType] || Lightbulb;

  const severityStyles = {
    alert: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-900/50',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    },
    warning: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    success: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    },
    info: {
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      border: 'border-indigo-200 dark:border-indigo-900/50',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    },
  };

  const style = severityStyles[recommendation.severity] || severityStyles.info;

  return (
    <div
      className={`rounded-3xl border ${style.border} ${style.bg} p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className={`p-3 rounded-2xl ${style.iconBg} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          {recommendation.category && (
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.badge}`}
            >
              {recommendation.category}
            </span>
          )}
        </div>

        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          {recommendation.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {recommendation.message}
        </p>
      </div>
    </div>
  );
};

export default RecommendationCard;
