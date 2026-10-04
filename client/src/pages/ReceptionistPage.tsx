import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Phone,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { ApiService } from '../services/api';
import { AIChatResponse } from '../types/index';
import { MessageBubble } from '../components/MessageBubble';
import { VoiceControls } from '../components/VoiceControls';

interface MessageItem {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: string;
  toolCalls?: any[];
  activeBooking?: any;
  createdAt: string;
}

export const ReceptionistPage: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    'Book an appointment',
    'What are your consultation timings?',
    'Where is NovaCare Clinic located?',
    'What services do you offer?',
  ]);
  const [liveIntent, setLiveIntent] = useState<string>('GREETING');
  const [confidence, setConfidence] = useState<number>(0.98);
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    service?: string;
    appointmentDate?: string;
    appointmentTime?: string;
  }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial welcome message
  useEffect(() => {
    const welcomeMsg: MessageItem = {
      id: 'welcome-1',
      role: 'ASSISTANT',
      content:
        '👋 Welcome to **NovaCare Clinic**! I am your 24/7 AI Virtual Receptionist.\n\nI can assist you with scheduling an appointment, checking doctor availability, providing business hours, giving location directions, or transferring you to our staff.',
      intent: 'GREETING',
      createdAt: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    // Append user message immediately
    const userMsgId = 'user-' + Date.now();
    const userMsg: MessageItem = {
      id: userMsgId,
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: AIChatResponse = await ApiService.sendChatMessage({
        conversationId: conversationId || undefined,
        message: messageText,
        channel: 'WEB_CHAT',
      });

      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      setLiveIntent(response.intent);
      setConfidence(response.confidence);

      if (response.handoffRequired) {
        setHandoffTriggered(true);
      }

      // Update extracted customer information
      if (response.entities) {
        setCustomerDetails((prev) => ({
          ...prev,
          name: response.entities.customerName || prev.name,
          phone: response.entities.customerPhone || prev.phone,
          email: response.entities.customerEmail || prev.email,
          service: response.entities.service || prev.service,
          appointmentDate: response.entities.date || prev.appointmentDate,
          appointmentTime: response.entities.time || prev.appointmentTime,
        }));
      }

      if (response.activeBooking) {
        setCustomerDetails((prev) => ({
          ...prev,
          name: response.activeBooking?.customerName || prev.name,
          phone: response.activeBooking?.customerPhone || prev.phone,
          service: response.activeBooking?.serviceName || prev.service,
          appointmentDate: response.activeBooking?.date || prev.appointmentDate,
          appointmentTime: response.activeBooking?.time || prev.appointmentTime,
        }));
      }

      if (response.suggestedQuickReplies && response.suggestedQuickReplies.length > 0) {
        setQuickReplies(response.suggestedQuickReplies);
      }

      const assistantMsg: MessageItem = {
        id: 'ai-' + Date.now(),
        role: 'ASSISTANT',
        content: response.message,
        intent: response.intent,
        toolCalls: response.toolCalls,
        activeBooking: response.activeBooking,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: MessageItem = {
        id: 'err-' + Date.now(),
        role: 'ASSISTANT',
        content:
          "I'm sorry, I encountered a temporary connection issue. Please try again or ask to speak directly with our front desk receptionist.",
        intent: 'UNKNOWN',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setConversationId(null);
    setHandoffTriggered(false);
    setCustomerDetails({});
    setLiveIntent('GREETING');
    setConfidence(0.98);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'ASSISTANT',
        content: 'Conversation restarted. How may I help you today at NovaCare Clinic?',
        intent: 'GREETING',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'ASSISTANT')?.content;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Virtual Receptionist</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Online
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            NovaCare Clinic Front Desk • Conversational scheduling, business FAQs, and instant triage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetConversation}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Session
          </button>
        </div>
      </div>

      {/* Main Grid: Chat UI + Live Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Area (8 Cols) */}
        <div className="lg:col-span-8 glass-panel rounded-2xl border border-slate-800 flex flex-col h-[740px] shadow-2xl overflow-hidden relative">
          {/* Receptionist Header Card */}
          <div className="p-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-cyan-300" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  NovaCare AI Receptionist
                  <span className="text-[11px] font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    Tool-Enabled
                  </span>
                </div>
                <div className="text-xs text-slate-400">Average response time: &lt; 250ms</div>
              </div>
            </div>

            {/* Voice controls in header */}
            <VoiceControls
              onSendMessage={(spokenText) => handleSendMessage(spokenText)}
              lastAssistantMessage={lastAssistantMsg}
            />
          </div>

          {/* Handoff Notice Banner if triggered */}
          {handoffTriggered && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>
                  <strong>Escalation Active:</strong> A human receptionist has been notified to attend this thread.
                </span>
              </div>
              <span className="bg-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">STATUS: NEW</span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                intent={msg.intent}
                toolCalls={msg.toolCalls}
                activeBooking={msg.activeBooking}
                createdAt={msg.createdAt}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>AI Receptionist is checking schedules & thinking</span>
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Replies */}
          {quickReplies.length > 0 && (
            <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Suggestions:
              </span>
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 border border-slate-700 hover:border-indigo-500 whitespace-nowrap transition-all"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about consultation timings, book an appointment, clinic location, or ask for human..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side Inspector & Details Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Conversation State Panel */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Live Conversation State
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                ID: {conversationId ? conversationId.slice(0, 8) : 'NEW'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Detected Intent:</span>
                <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {liveIntent}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">AI Confidence:</span>
                <span className="font-semibold text-emerald-400">
                  {Math.round(confidence * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Human Handoff:</span>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    handoffTriggered
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {handoffTriggered ? 'ESCALATED' : 'AUTOMATED'}
                </span>
              </div>
            </div>
          </div>

          {/* Extracted Customer & Booking Snapshot */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Extracted Patient Profile
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Name:</span>
                <span className="font-medium text-slate-200">
                  {customerDetails.name || <span className="text-slate-600">Pending</span>}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-200">
                  {customerDetails.phone || <span className="text-slate-600">Pending</span>}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Service:</span>
                <span className="font-medium text-indigo-300">
                  {customerDetails.service || <span className="text-slate-600">Pending</span>}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Scheduled Date:</span>
                <span className="font-medium text-emerald-400">
                  {customerDetails.appointmentDate || <span className="text-slate-600">Pending</span>}
                </span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-400">Time Slot:</span>
                <span className="font-medium text-emerald-400">
                  {customerDetails.appointmentTime || <span className="text-slate-600">Pending</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Clinic Quick Facts */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3 text-xs shadow-xl">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Phone className="w-4 h-4 text-emerald-400" />
              NovaCare Clinic Fast Facts
            </h3>

            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Mon–Fri: 9am–6pm, Sat: 9am–4pm (Sun: Closed)</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>742 Evergreen Terrace, Suite 100</span>
              </div>
              <div className="flex items-start gap-2">
                <Headphones className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Emergency Front Desk: +1 (555) 234-5678</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
