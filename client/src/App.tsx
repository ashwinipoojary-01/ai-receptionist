import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ReceptionistPage } from './pages/ReceptionistPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminConversationsPage } from './pages/admin/AdminConversationsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminKnowledgeBasePage } from './pages/admin/AdminKnowledgeBasePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/receptionist" element={<ReceptionistPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboardOverview />} />
                  <Route path="appointments" element={<AdminAppointmentsPage />} />
                  <Route path="conversations" element={<AdminConversationsPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="knowledge-base" element={<AdminKnowledgeBasePage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};
