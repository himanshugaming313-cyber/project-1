import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Lightbulb,
  Target,
  PiggyBank,
  PieChart,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Info,
  Award,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import recommendationService from '../services/recommendationService';

export const Recommendations = () => {
  const { user } = useAuth();
  const currency = user?.currency || '₹';

  const [data, setData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [recRes, healthRes] = await Promise.all([
        recommendationService.getRecommendations(),
        recommendationService.getFinancialHealth(),
      ]);

      if (recRes.success) setData(recRes.data);
      if (healthRes.success) setHealthScore(healthRes.data);
    } catch (err) {
      console.error('Failed to load recommendation data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Analyzing your spending patterns..." size="lg" />
      </div>
    );
  }

  const insights = data?.insights;
  const score = healthScore?.score || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-indigo-500" />
          Smart Insights & Financial Health
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Personalized, data-driven suggestions to build lifelong financial habits.
        </p>
      </div>

      {/* Financial Health Score Hero Section */}
      {healthScore && (
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-indigo-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left: Score Gauge / Big Number */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                Educational Health Score
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-6xl sm:text-7xl font-extrabold font-display tracking-tight text-white">
                  {score}
                </span>
                <span className="text-2xl font-bold text-indigo-300">/ 100</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
                Status: {healthScore.grade}
              </div>
            </div>

            {/* Middle: Factors List */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-3">
                Score Factor Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {healthScore.factors?.map((f, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center font-bold mb-1">
                      <span className="text-white">{f.title}</span>
                      <span className="text-indigo-300">
                        {f.points} / {f.maxPoints} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-100/70 leading-relaxed">
                      {f.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Educational Disclaimer */}
          <div className="mt-8 pt-6 border-t border-indigo-800/60 flex items-start gap-2.5 text-xs text-indigo-300/80">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <p className="text-[11px] leading-relaxed">
              <strong className="text-white">Note:</strong> {healthScore.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* 4 Core Structured Personalized Insights */}
      {insights && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            Personalized Spending Suggestions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Spending Insight */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 w-fit mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Spending Insight
              </h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {insights.spendingInsight}
              </p>
            </div>

            {/* Budget Goal */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 w-fit mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Budget Goal
              </h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {insights.budgetGoal}
              </p>
            </div>

            {/* Saving Opportunity */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 w-fit mb-4">
                <PiggyBank className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Saving Opportunity
              </h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {insights.savingOpportunity}
              </p>
            </div>

            {/* Category Insight */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 w-fit mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category Focus
              </h4>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {insights.categoryInsight}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Smart Recommendations List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
          Rule-Based Recommendations ({data?.recommendations?.length || 0})
        </h2>

        {data?.recommendations?.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">
              No active spending warnings!
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Your spending is balanced across categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data?.recommendations?.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        )}
      </div>

      {/* Financial Habits & Safety Section */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          Teen Financial Safety Guidelines
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          TeenTrack is built purely for educational budgeting, expense tracking, and personal habit improvement. We will never sell credit cards, recommend speculative stocks or crypto, or push loans. Your habits today build your freedom tomorrow!
        </p>
      </div>
    </div>
  );
};

export default Recommendations;
