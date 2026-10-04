import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
  Search,
  Check,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Conversation, HumanHandoff } from '../../types/index';

export const AdminConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [handoffs, setHandoffs] = useState<HumanHandoff[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conversations' | 'handoffs'>('conversations');

  const loadData = async () => {
    try {
      setLoading(true);
      const [convRes, handoffRes] = await Promise.all([
        ApiService.getConversations(),
        ApiService.getHandoffs(),
      ]);
      setConversations(convRes.conversations || []);
      setHandoffs(handoffRes.handoffs || []);
      if (!selectedConv && convRes.conversations?.length > 0) {
        setSelectedConv(convRes.conversations[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveHandoff = async (handoffId: string) => {
    try {
      await ApiService.updateHandoff(handoffId, 'RESOLVED', 'Resolved by front desk staff');
      loadData();
    } catch (err) {
      alert('Failed to update handoff');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">AI Reception Logs & Human Escalations</h2>
        <p className="text-sm text-slate-400">
          Inspect full multi-turn conversational transcripts, extracted entity metadata, and resolve human receptionist handoffs
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'conversations'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>All Conversations ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('handoffs')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'handoffs'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Escalation Queue ({handoffs.filter((h) => h.status === 'NEW').length} New)</span>
        </button>
      </div>

      {activeTab === 'handoffs' ? (
        /* Escalation Handoff Queue */
        <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Active Human Handoff Requests
          </h3>

          <div className="space-y-3">
            {handoffs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                No active human handoffs. AI virtual receptionist is operating normally.
              </div>
            ) : (
              handoffs.map((h) => (
                <div
                  key={h.id}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {h.customerName || 'Anonymous Visitor'}
                      </span>
                      {h.customerPhone && (
                        <span className="text-xs text-indigo-400 font-mono">({h.customerPhone})</span>
                      )}
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          h.status === 'NEW'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Escalation Reason:</strong> {h.reason}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Triggered at: {new Date(h.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {h.status === 'NEW' && (
                    <button
                      onClick={() => handleResolveHandoff(h.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start md:self-center transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Two Pane: Conversations List + Transcript Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Conversation List (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl border border-slate-800 p-4 space-y-3 max-h-[700px] overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedConv?.id === conv.id
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">
                    {conv.customer?.name || 'Visitor Session'}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      conv.status === 'ESCALATED'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {conv.summary || 'Customer dialog in progress...'}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>Intent: <strong className="text-indigo-300">{conv.primaryIntent || 'N/A'}</strong></span>
                  <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Transcript Viewer (7 Cols) */}
          <div className="lg:col-span-7 glass-card rounded-2xl border border-slate-800 p-6 space-y-4 min-h-[500px]">
            {selectedConv ? (
              <>
                <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {selectedConv.customer?.name || 'Visitor Conversation Transcript'}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Channel: {selectedConv.channel}</span>
                      <span>•</span>
                      <span>ID: {selectedConv.id}</span>
                    </div>
                  </div>

                  {selectedConv.summary && (
                    <div className="max-w-xs text-right text-[11px] text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <strong className="text-indigo-300">Summary:</strong> {selectedConv.summary}
                    </div>
                  )}
                </div>

                {/* Chat History */}
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                  {selectedConv.messages && selectedConv.messages.length > 0 ? (
                    selectedConv.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl text-xs space-y-1 ${
                          m.role === 'USER'
                            ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 ml-8'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                          <span>{m.role === 'USER' ? 'Customer' : 'AI Receptionist'}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                        {m.intent && (
                          <div className="text-[10px] text-indigo-400 font-mono pt-1">
                            Intent: {m.intent}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">No messages recorded</div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500">
                Select a conversation on the left to view the complete transcript.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
