import React from 'react';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../utils/index';

interface MessageBubbleProps {
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: string;
  toolCalls?: any[];
  activeBooking?: any;
  createdAt?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  intent,
  toolCalls,
  activeBooking,
  createdAt,
}) => {
  const isUser = role === 'USER';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in duration-300`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 p-[1px] shadow-md flex-shrink-0 mt-1">
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      )}

      <div className={`max-w-[82%] sm:max-w-[70%] space-y-2`}>
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-none shadow-sm'
          }`}
        >
          {/* Markdown-style bullet formatting */}
          <div className="whitespace-pre-line space-y-1">
            {content}
          </div>

          {/* Active Booking Card in Assistant Message */}
          {activeBooking && (
            <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Appointment Confirmed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 border-t border-emerald-500/20">
                <div>
                  <span className="text-slate-400">Service:</span> {activeBooking.serviceName}
                </div>
                <div>
                  <span className="text-slate-400">Date:</span> {activeBooking.date}
                </div>
                <div>
                  <span className="text-slate-400">Time:</span> {formatTime(activeBooking.time)}
                </div>
                <div>
                  <span className="text-slate-400">Patient:</span> {activeBooking.customerName}
                </div>
              </div>
            </div>
          )}

          {/* Intent Tag Indicator for transparency */}
          {!isUser && intent && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Intent: <strong className="text-indigo-300 font-mono">{intent}</strong></span>
              {toolCalls && toolCalls.length > 0 && (
                <span className="text-slate-500">
                  • {toolCalls.length} tool {toolCalls.length === 1 ? 'call' : 'calls'} executed
                </span>
              )}
            </div>
          )}
        </div>

        {createdAt && (
          <div className={`text-[10px] text-slate-500 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};
