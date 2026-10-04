import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Calendar,
  Mic,
  MessageSquare,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Stethoscope,
  Scissors,
  Hotel,
  Home,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Next-Generation AI Virtual Receptionist Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto mb-6">
            Your AI Receptionist,{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Available 24/7.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Answer questions, schedule appointments, and handle customer conversations automatically — while your team focuses on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/receptionist"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 text-base group"
            >
              <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Try AI Receptionist</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-base"
            >
              <span>View Admin Dashboard</span>
            </Link>
          </div>

          {/* Interactive Live Demo Preview Box */}
          <div className="max-w-4xl mx-auto glass-panel rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-500 font-mono ml-2">NovaCare AI Virtual Receptionist Simulation</span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                Tool Calling Active
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-none max-w-md shadow">
                  Hi, I need to book an appointment for tomorrow afternoon.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none max-w-lg shadow space-y-1">
                  <div>Of course! I&apos;d be happy to help. What service would you like to book?</div>
                  <div className="text-[10px] text-indigo-400 font-mono pt-1">Intent: BOOK_APPOINTMENT (94% confidence)</div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-br-none max-w-md shadow">
                  General Consultation.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none max-w-lg shadow space-y-1">
                  <div>We have 2:00 PM, 3:30 PM, and 5:00 PM available tomorrow. Which works best for you?</div>
                  <div className="text-[10px] text-indigo-400 font-mono pt-1">Tool: checkAvailableSlots(&apos;tomorrow&apos;, serviceId)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Engineered for Real Commercial Workflows
            </h2>
            <p className="text-slate-400">
              Not a toy bot. A fully integrated receptionist engine capable of verified calendar bookings, FAQs, voice synthesis, and human handoffs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bot,
                title: '24/7 AI Receptionist',
                desc: 'Greets visitors politely, detects intents with high confidence, and operates tirelessly 24 hours a day.',
              },
              {
                icon: Calendar,
                title: 'Smart Appointment Booking',
                desc: 'Strict double-booking prevention, real-time slot checking, rescheduling, and cancellation management.',
              },
              {
                icon: Mic,
                title: 'Voice Conversations',
                desc: 'Two-way voice interface with modular speech-to-text recognition and spoken audio playback.',
              },
              {
                icon: MessageSquare,
                title: 'Instant FAQ Answers',
                desc: 'Knowledge base retriever providing verified answers about clinic hours, locations, and procedures.',
              },
              {
                icon: ShieldCheck,
                title: 'Human Handoff',
                desc: 'Automatically escalates frustrated callers, complex inquiries, or special cases to human receptionists.',
              },
              {
                icon: Zap,
                title: 'Conversation Summaries',
                desc: 'Generates concise clinical summaries and intent tags on every interaction for rapid staff review.',
              },
              {
                icon: Users,
                title: 'Customer Management',
                desc: 'Builds comprehensive patient profiles with appointment histories, preferences, and notes.',
              },
              {
                icon: Clock,
                title: 'Business Hours & Services',
                desc: 'Full administrative control over operational schedules, closed days, consultation types, and prices.',
              },
            ].map((f, idx) => (
              <div
                key={idx}
                className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">How It Works</h2>
            <p className="text-slate-400">Streamlined conversational pipeline from initial greeting to confirmed appointment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Customer Contacts', desc: 'Customer initiates text or voice chat with the AI Receptionist.' },
              { step: '02', title: 'Intent Detection', desc: 'AI analyzes intent, confidence, and extracts booking entities.' },
              { step: '03', title: 'Tool Calling', desc: 'Queries real availability, slots, or business knowledge base.' },
              { step: '04', title: 'Verified Booking', desc: 'Records verified appointment in database and confirms with patient.' },
              { step: '05', title: 'Staff Review', desc: 'Receptionist inspects summary, transcript, and handoff alerts in dashboard.' },
            ].map((s, idx) => (
              <div key={idx} className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-2xl font-bold text-indigo-400 font-mono">{s.step}</div>
                <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Use Cases */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Tailored for Any Industry</h2>
            <p className="text-slate-400">Customized persona prompts, tool definitions, and workflows for modern service businesses</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Stethoscope, title: 'Clinics & Dental Practices', desc: 'Schedule general checkups, dental cleanings, verify clinic hours, and triage urgent medical calls.' },
              { icon: Scissors, title: 'Salons & Spas', desc: 'Book hair styling, massage therapies, manage stylist calendars, and handle rescheduling easily.' },
              { icon: Hotel, title: 'Hotels & Hospitality', desc: 'Handle check-in inquiries, room bookings, amenities, concierge assistance, and local recommendations.' },
              { icon: Home, title: 'Real Estate Agencies', desc: 'Arrange property viewings, gather buyer criteria, and qualify prospective tenants around the clock.' },
              { icon: Building2, title: 'Corporate Offices', desc: 'Direct visitor check-ins, manage conference room bookings, and route executive inquiries.' },
              { icon: Briefcase, title: 'Service Companies', desc: 'Automate quoting, service calls for plumbing/HVAC/law firms, and emergency dispatch.' },
            ].map((u, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <u.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{u.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">AI Receptionist SaaS</span>
            <span>• NovaCare Clinic System</span>
          </div>
          <div>Built with React, Vite, Node.js, Express, TypeScript, and Prisma ORM.</div>
        </div>
      </footer>
    </div>
  );
};
