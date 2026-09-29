import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ChartCard from '../components/ChartCard';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import analyticsService from '../services/analyticsService';
import { formatCurrency } from '../utils/formatCurrency';

const PALETTE = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#64748b', // Slate
];

export const Analytics = () => {
  const { user, darkMode } = useAuth();
  const currency = user?.currency || '₹';

  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, dailyRes, trendRes, compRes, patternRes] = await Promise.all([
        analyticsService.getCategoryBreakdown({
          startDate: period === 'custom' ? customStart : undefined,
          endDate: period === 'custom' ? customEnd : undefined,
        }),
        analyticsService.getDailySpending({
          startDate: period === 'custom' ? customStart : undefined,
          endDate: period === 'custom' ? customEnd : undefined,
        }),
        analyticsService.getMonthlyTrend(),
        analyticsService.getComparison({
          rangeKey: period,
          startDate: period === 'custom' ? customStart : undefined,
          endDate: period === 'custom' ? customEnd : undefined,
        }),
        analyticsService.getSpendingPatterns(),
      ]);

      if (catRes.success) setCategoryData(catRes.data?.categories || []);
      if (dailyRes.success) setDailyData(dailyRes.data || []);
      if (trendRes.success) setMonthlyTrend(trendRes.data || []);
      if (compRes.success) setComparison(compRes.data || null);
      if (patternRes.success) setPatterns(patternRes.data || null);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'this_week', label: 'This Week' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'custom', label: 'Custom Range' },
  ];

  const gridColor = darkMode ? '#1e293b' : '#f1f5f9';
  const textColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-8 pb-16">
      {/* Header and Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-500" />
            Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visual graphs, spending patterns, and category comparisons.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                period === p.key
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers (if custom period selected) */}
      {period === 'custom' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-wrap text-xs font-semibold">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>From:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <span>To:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
          <button
            onClick={loadAnalytics}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors ml-auto"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Period Summary Metric Cards */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Period Spending"
            value={formatCurrency(comparison.totalExpenses || 0, currency)}
            subtitle={`${comparison.transactionCount || 0} transactions in this timeframe`}
            icon={DollarSign}
            variant="rose"
          />

          <StatCard
            title="Period Income"
            value={formatCurrency(comparison.totalIncome || 0, currency)}
            subtitle="Recorded entries in period"
            icon={TrendingUp}
            variant="emerald"
          />

          <StatCard
            title="Net Savings Buffer"
            value={formatCurrency(comparison.savings || 0, currency)}
            subtitle={comparison.savings >= 0 ? 'Surplus' : 'Deficit in period'}
            icon={Sparkles}
            variant={comparison.savings >= 0 ? 'indigo' : 'amber'}
            badge={comparison.savings >= 0 ? 'Surplus' : 'Deficit'}
            badgeType={comparison.savings >= 0 ? 'positive' : 'negative'}
          />
        </div>
      )}

      {loading ? (
        <div className="py-20">
          <LoadingSpinner message="Generating visualizations..." size="lg" />
        </div>
      ) : (
        <>
          {/* Charts Row 1: Pie Chart & Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart: Where is my money going? */}
            <ChartCard
              title="Where is my money going?"
              subtitle="Category breakdown and spending distribution"
            >
              {categoryData.length === 0 ? (
                <EmptyState
                  title="No category data"
                  description="Log transactions to see your spending pie chart."
                />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="total"
                      nameKey="category"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PALETTE[index % PALETTE.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '1rem',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Bar Chart: Category Spending Comparison */}
            <ChartCard
              title="Category Spending Comparison"
              subtitle="Comparing expenses across all active categories"
            >
              {categoryData.length === 0 ? (
                <EmptyState
                  title="No comparison data"
                  description="Add expenses to compare category spending."
                />
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="category"
                      stroke={textColor}
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis
                      stroke={textColor}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${currency}${val}`}
                    />
                    <Tooltip
                      formatter={(val) => formatCurrency(val, currency)}
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '1rem',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" name="Spent" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Charts Row 2: Expense Over Time (Area / Line Chart) */}
          <ChartCard
            title="Expense Over Time"
            subtitle="Track your daily spending velocity and detect spikes"
          >
            {dailyData.length === 0 ? (
              <EmptyState
                title="No daily data"
                description="Transactions over consecutive days will show here."
              />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip
                    formatter={(val) => formatCurrency(val, currency)}
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    name="Daily Spending"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#spendingGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* 6-Month Income vs Expense Trend */}
          <ChartCard
            title="6-Month Income vs Expense Trend"
            subtitle="Long-term financial habit progression"
          >
            {monthlyTrend.length === 0 ? (
              <EmptyState title="No historical trend data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyTrend}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="month" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis
                    stroke={textColor}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${currency}${val}`}
                  />
                  <Tooltip
                    formatter={(val) => formatCurrency(val, currency)}
                    contentStyle={{
                      backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                      borderColor: darkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Deep Spending Pattern Statistics */}
          {patterns && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    Spending Habit & Pattern Analysis
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated from your genuine transaction rhythms
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Daily Average
                  </span>
                  <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {formatCurrency(patterns.averageDailySpending || 0, currency)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">Per active day</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Weekly Average
                  </span>
                  <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {formatCurrency(patterns.averageWeeklySpending || 0, currency)}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">7-day pacing</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Peak Spending Day
                  </span>
                  <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                    {patterns.highestSpendingDay
                      ? formatCurrency(patterns.highestSpendingDay.amount, currency)
                      : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5 truncate">
                    {patterns.highestSpendingDay?.date || 'No single peak'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Top Category
                  </span>
                  <span className="text-xl font-bold font-display text-slate-900 dark:text-white truncate block">
                    {patterns.highestCategory?.category || 'None'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {patterns.highestCategory?.percentage}% of total
                  </span>
                </div>
              </div>

              {/* Necessary vs Unnecessary Needs/Wants Bar */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Essential Needs: {formatCurrency(patterns.necessityBreakdown?.necessaryAmount || 0, currency)} ({patterns.necessityBreakdown?.necessaryPercentage || 0}%)
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    Non-Essential Wants: {formatCurrency(patterns.necessityBreakdown?.unnecessaryAmount || 0, currency)} ({patterns.necessityBreakdown?.unnecessaryPercentage || 0}%)
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${patterns.necessityBreakdown?.necessaryPercentage || 50}%` }}
                    title="Needs"
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${patterns.necessityBreakdown?.unnecessaryPercentage || 50}%` }}
                    title="Wants"
                  />
                </div>
              </div>

              {/* Payment Methods breakdown */}
              {patterns.paymentMethods && patterns.paymentMethods.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Channel Breakdown
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {patterns.paymentMethods.map((pm) => (
                      <div
                        key={pm.method}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
                      >
                        <span className="text-[11px] font-semibold text-slate-500 block truncate">
                          {pm.method}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                          {formatCurrency(pm.amount, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400">{pm.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
