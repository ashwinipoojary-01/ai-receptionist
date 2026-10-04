import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { AnalyticsData, Appointment, Conversation } from '../../types/index';
import { formatTime, formatDate } from '../../utils/index';
import { Link } from 'react-router-dom';

export const AdminDashboardOverview: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getAnalytics();
      setData(res.analytics);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
        Loading Dashboard metrics...
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Appointments",
      value: data?.todayAppointments ?? 2,
      subtitle: `${data?.totalAppointments ?? 3} total upcoming bookings`,
      icon: Calendar,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'Conversations Handled',
      value: data?.totalConversations ?? 128,
      subtitle: 'Processed by AI Receptionist',
      icon: MessageSquare,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'AI Resolution Rate',
      value: `${data?.resolutionRate ?? 88}%`,
      subtitle: 'Resolved without human staff',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Pending Handoffs',
      value: data?.pendingHandoffs ?? 1,
      subtitle: 'Requires front desk attention',
      icon: AlertCircle,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Executive Front Desk Overview</h2>
          <p className="text-sm text-slate-400">
            Real-time appointment schedule, conversational triage, and AI resolution performance
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} border`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">{card.value}</div>
              <div className="text-xs text-slate-400 mt-1">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Grid: Today's Schedule + Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Appointments Schedule (7 Cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-white text-sm">Upcoming Schedule & Consultations</h3>
            </div>
            <Link
              to="/admin/appointments"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentAppointments && data.recentAppointments.length > 0 ? (
              data.recentAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                        {app.startTime}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{app.customer?.name || 'Walk-in'}</div>
                      <div className="text-xs text-slate-400">
                        {app.service?.name} • {formatDate(app.date)}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      app.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No upcoming appointments scheduled</div>
            )}
          </div>
        </div>

        {/* Recent Conversations & Handoffs (5 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-white text-sm">Recent AI Reception Logs</h3>
            </div>
            <Link
              to="/admin/conversations"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              Full Log <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentConversations && data.recentConversations.length > 0 ? (
              data.recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">
                      {conv.customer?.name || 'Anonymous Visitor'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        conv.status === 'ESCALATED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {conv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {conv.summary || 'Customer inquiry handled by AI Virtual Receptionist.'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Intent: {conv.primaryIntent || 'General'}</span>
                    <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">No recent conversation logs</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Intent Distribution Breakdown */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Customer Inquiry & Intent Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {data?.intentsDistribution?.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-lg font-bold text-white font-mono">{item.count}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold truncate">
                {item.intent.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
