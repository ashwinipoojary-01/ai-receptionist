import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Sparkles, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">AI Receptionist</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                SaaS v1.0
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">NovaCare Clinic Engine</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/receptionist"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname === '/receptionist'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Live Receptionist
          </Link>
          <Link
            to="/admin"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin')
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Portal
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/receptionist"
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-lg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Try AI Receptionist
          </Link>

          <Link
            to="/admin"
            className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            {isAuthenticated ? 'Dashboard' : 'Admin Login'}
          </Link>
        </div>
      </div>
    </header>
  );
};
