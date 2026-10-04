import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Mail,
  Calendar,
  Search,
  ChevronRight,
  FileText,
  UserCheck,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Customer } from '../../types/index';
import { formatDate } from '../../utils/index';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getCustomers();
      setCustomers(res.customers || []);
      if (!selectedCustomer && res.customers?.length > 0) {
        setSelectedCustomer(res.customers[0]);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Patient & Customer Directory</h2>
        <p className="text-sm text-slate-400">
          Manage patient contact records, past consultation histories, and clinical notes
        </p>
      </div>

      {/* Search bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name, telephone, or email address..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Two Columns: List & Detailed Customer Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer List (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl border border-slate-800 p-4 space-y-3 max-h-[700px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading patients...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">No matching patient records found.</div>
          ) : (
            filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedCustomer?.id === cust.id
                    ? 'bg-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">{cust.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-indigo-400" /> {cust.phone}
                    </span>
                    {cust.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-cyan-400" /> {cust.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                    {cust.appointments?.length || 0} Bookings
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Customer Detailed Profile (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl border border-slate-800 p-6 space-y-6">
          {selectedCustomer ? (
            <>
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-bold text-lg text-white">
                    {selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
                  <div className="text-xs text-slate-400">
                    Patient Profile ID: <span className="font-mono">{selectedCustomer.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Phone Number</span>
                  <div className="font-semibold text-white font-mono">{selectedCustomer.phone}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-slate-500">Email Address</span>
                  <div className="font-semibold text-white truncate">{selectedCustomer.email || 'None registered'}</div>
                </div>
              </div>

              {/* Clinical Notes */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Clinical & Intake Notes</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedCustomer.notes || 'No intake notes recorded.'}
                </div>
              </div>

              {/* Appointment History */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Appointment History</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedCustomer.appointments && selectedCustomer.appointments.length > 0 ? (
                    selectedCustomer.appointments.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-medium text-white">{app.service?.name || 'Consultation'}</div>
                          <div className="text-slate-400 text-[11px] font-mono">
                            {formatDate(app.date)} at {app.startTime}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs text-center py-4">No appointment records.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select a patient from the list to view their complete profile.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
