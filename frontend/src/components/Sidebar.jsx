import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Target,
  PieChart,
  Sparkles,
  User,
  ShieldAlert,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/add-expense', label: 'Add Expense', icon: PlusCircle },
    { to: '/budgets', label: 'Budgets', icon: Target },
    { to: '/analytics', label: 'Analytics', icon: PieChart },
    { to: '/recommendations', label: 'Smart Insights', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md p-4 space-y-6">
      <div className="px-3 py-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Finance Management
        </p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Teen Saver Tip</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Default currency is set to <span className="font-bold text-slate-900 dark:text-white">{user?.currency || '₹'}</span>. You can customize it anytime in Profile.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
