import React, { useState, useEffect } from 'react';
import {
  Building2,
  Clock,
  Briefcase,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { Business, Service, WorkingHour } from '../../types/index';

export const AdminSettingsPage: React.FC = () => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Service state
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(75);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes] = await Promise.all([
        ApiService.getBusinessProfile(),
        ApiService.getServices(),
      ]);
      setBusiness(bRes.business);
      setWorkingHours(bRes.business?.workingHours || []);
      setServices(sRes.services || []);
    } catch (err) {
      console.error('Failed to load business settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    try {
      await Promise.all([
        ApiService.updateBusinessProfile(business),
        ApiService.updateWorkingHours(workingHours),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createService({
        name: newServiceName,
        description: newServiceDesc,
        duration: Number(newServiceDuration),
        price: Number(newServicePrice),
      });
      setNewServiceName('');
      setNewServiceDesc('');
      loadData();
    } catch (err) {
      alert('Failed to add service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await ApiService.deleteService(id);
      loadData();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400 text-xs">Loading business configuration...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clinic Configuration & Schedule</h2>
          <p className="text-sm text-slate-400">
            Configure business identity, operational working hours, and consultation services
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Configuration Saved!
          </div>
        )}
      </div>

      <form onSubmit={handleUpdateBusiness} className="space-y-8">
        {/* Business Profile Details */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Business Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Clinic Name</label>
              <input
                type="text"
                value={business?.name || ''}
                onChange={(e) => setBusiness(business ? { ...business, name: e.target.value } : null)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={business?.tagline || ''}
                onChange={(e) => setBusiness(business ? { ...business, tagline: e.target.value } : null)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Telephone Number</label>
              <input
                type="text"
                value={business?.phone || ''}
                onChange={(e) => setBusiness(business ? { ...business, phone: e.target.value } : null)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contact Email</label>
              <input
                type="email"
                value={business?.email || ''}
                onChange={(e) => setBusiness(business ? { ...business, email: e.target.value } : null)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Physical Address</label>
              <input
                type="text"
                value={business?.address || ''}
                onChange={(e) => setBusiness(business ? { ...business, address: e.target.value } : null)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Working Hours Editor */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
            <Clock className="w-4 h-4 text-emerald-400" />
            Working Hours Schedule
          </h3>

          <div className="space-y-2 text-xs">
            {workingHours.map((wh, idx) => (
              <div
                key={wh.id || idx}
                className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="w-28 font-bold text-white">{wh.dayName}</div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wh.isClosed}
                      onChange={(e) => {
                        const updated = [...workingHours];
                        updated[idx].isClosed = e.target.checked;
                        setWorkingHours(updated);
                      }}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Closed</span>
                  </label>

                  {!wh.isClosed && (
                    <div className="flex items-center gap-2 font-mono">
                      <input
                        type="text"
                        value={wh.openTime}
                        onChange={(e) => {
                          const updated = [...workingHours];
                          updated[idx].openTime = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-center text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="text"
                        value={wh.closeTime}
                        onChange={(e) => {
                          const updated = [...workingHours];
                          updated[idx].closeTime = e.target.value;
                          setWorkingHours(updated);
                        }}
                        className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-center text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Schedule</span>
          </button>
        </div>
      </form>

      {/* Services List & Add Service */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <h3 className="font-bold text-white text-base flex items-center gap-2 pb-3 border-b border-slate-800">
          <Briefcase className="w-4 h-4 text-cyan-400" />
          Consultation Services ({services.length})
        </h3>

        {/* Existing services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {services.map((s) => (
            <div key={s.id} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 relative">
              <div className="flex justify-between items-start">
                <span className="font-bold text-white text-sm">{s.name}</span>
                <button
                  onClick={() => handleDeleteService(s.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-400 leading-relaxed">{s.description}</p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 font-mono">
                <span className="text-indigo-400">{s.duration} mins</span>
                <span className="font-bold text-emerald-400">${s.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Add new service form */}
        <form onSubmit={handleAddService} className="pt-4 border-t border-slate-800 space-y-3 text-xs">
          <div className="font-semibold text-slate-200">Add New Service</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              required
              placeholder="Service Name (e.g. Skin Screening)"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={newServiceDesc}
              onChange={(e) => setNewServiceDesc(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              required
              placeholder="Duration (min)"
              value={newServiceDuration}
              onChange={(e) => setNewServiceDuration(Number(e.target.value))}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              required
              placeholder="Price ($)"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(Number(e.target.value))}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
