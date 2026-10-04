import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  HelpCircle,
  Settings,
  LogOut,
  Bot,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { label: 'Conversations & Handoffs', path: '/admin/conversations', icon: MessageSquare },
    { label: 'Patients Directory', path: '/admin/customers', icon: Users },
    { label: 'Knowledge Base (FAQ)', path: '/admin/knowledge-base', icon: HelpCircle },
    { label: 'Clinic Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-slate-800 bg-slate-950/60 p-4 space-y-6 flex-shrink-0">
        {/* User Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@novacareclinic.com'}</div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-1 text-xs">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Live Receptionist shortcut & Logout */}
        <div className="pt-6 border-t border-slate-800/80 space-y-2">
          <Link
            to="/receptionist"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Open Receptionist Chat</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
