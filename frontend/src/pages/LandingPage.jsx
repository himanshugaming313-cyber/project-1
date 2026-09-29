import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Receipt,
  PieChart,
  Target,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Receipt,
      title: 'Track Expenses in Seconds',
      description: 'Log campus meals, transit, gaming, and online purchases with easy Want vs Need categorization.',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    },
    {
      icon: Target,
      title: 'Smart Category Budgets',
      description: 'Set realistic monthly limits. Get helpful visual alerts when you cross 80% or 100% of your cap.',
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    {
      icon: PieChart,
      title: 'Interactive Visual Analytics',
      description: 'See exactly where your money goes with dynamic Recharts pie charts, trend lines, and monthly comparisons.',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    },
    {
      icon: Sparkles,
      title: 'Actionable Smart Insights',
      description: 'Deterministic rule engine identifies subscription leaks and highlights real saving opportunities.',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    {
      icon: TrendingUp,
      title: 'Financial Health Score',
      description: 'Check your educational 0–100 score calculated from your savings rate and budget discipline.',
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    },
    {
      icon: ShieldCheck,
      title: 'Bank-Grade Security',
      description: 'Encrypted with bcrypt (12 rounds) and JWT authentication. Your financial data is private and strictly isolated.',
      color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border-sky-200 dark:border-sky-800',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs sm:text-sm font-bold shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Zap className="w-4 h-4 text-indigo-500" />
          The Ultimate Expense & Budgeting App for Students & Teens
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
          Know Where Your <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Money Goes.</span>
          <br />
          Build Better Money Habits.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Track your expenses, understand your spending habits, curb impulse buys, and make smarter everyday money decisions.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
          >
            {isAuthenticated ? 'Open Dashboard' : 'Get Started for Free'}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-base hover:bg-slate-50 dark:hover:bg-slate-850 transition-all"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            100% Free Forever
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No Complex Banking Jargon
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Works Seamlessly on Mobile
          </span>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Designed for the Way You Actually Spend
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base mt-3">
            Say goodbye to clunky spreadsheets and boring old bank apps. TeenTrack makes personal finance fun and clear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl border ${f.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-8 sm:p-12 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-4">
            Take Control of Your Spending Today
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Join teenagers and young adults building financial independence, saving money on impulse buys, and mastering budgets.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Create Your Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
