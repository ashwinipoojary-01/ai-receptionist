const API_BASE = '/api';

export class ApiService {
  private static getHeaders(includeAuth = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // AUTH
  static async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  }

  static async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(true),
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }

  // AI CHAT
  static async sendChatMessage(params: {
    conversationId?: string;
    message: string;
    channel?: 'WEB_CHAT' | 'VOICE';
  }) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  }

  static async detectIntent(message: string) {
    const res = await fetch(`${API_BASE}/ai/intent`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message }),
    });
    return res.json();
  }

  // APPOINTMENTS
  static async checkAvailability(date: string, serviceId?: string) {
    const url = new URL(`${window.location.origin}${API_BASE}/appointments/availability`);
    url.searchParams.append('date', date);
    if (serviceId) url.searchParams.append('serviceId', serviceId);

    const res = await fetch(url.toString(), { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch slot availability');
    return res.json();
  }

  static async getAppointments(params?: { date?: string; customerId?: string; status?: string }) {
    const url = new URL(`${window.location.origin}${API_BASE}/appointments`);
    if (params?.date) url.searchParams.append('date', params.date);
    if (params?.customerId) url.searchParams.append('customerId', params.customerId);
    if (params?.status) url.searchParams.append('status', params.status);

    const res = await fetch(url.toString(), { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  }

  static async createAppointment(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    date: string;
    startTime: string;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create appointment' }));
      throw new Error(err.error || 'Failed to create appointment');
    }
    return res.json();
  }

  static async rescheduleAppointment(id: string, newDate: string, newStartTime: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ newDate, newStartTime }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to reschedule' }));
      throw new Error(err.error || 'Failed to reschedule');
    }
    return res.json();
  }

  static async updateAppointmentStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update appointment status');
    return res.json();
  }

  static async cancelAppointment(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to cancel appointment');
    return res.json();
  }

  // CUSTOMERS
  static async getCustomers() {
    const res = await fetch(`${API_BASE}/customers`, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  }

  static async getCustomerById(id: string) {
    const res = await fetch(`${API_BASE}/customers/${id}`, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch customer profile');
    return res.json();
  }

  // SERVICES
  static async getServices(onlyActive = false) {
    const res = await fetch(`${API_BASE}/services?active=${onlyActive}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  }

  static async createService(data: any) {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create service');
    return res.json();
  }

  static async updateService(id: string, data: any) {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update service');
    return res.json();
  }

  static async deleteService(id: string) {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
  }

  // CONVERSATIONS & HANDOFFS
  static async getConversations() {
    const res = await fetch(`${API_BASE}/conversations`, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  }

  static async getConversationById(id: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}`, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch conversation');
    return res.json();
  }

  static async getHandoffs(status?: string) {
    const url = status ? `${API_BASE}/handoffs?status=${status}` : `${API_BASE}/handoffs`;
    const res = await fetch(url, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch handoffs');
    return res.json();
  }

  static async updateHandoff(id: string, status: string, resolutionNote?: string) {
    const res = await fetch(`${API_BASE}/handoffs/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status, resolutionNote }),
    });
    if (!res.ok) throw new Error('Failed to update handoff');
    return res.json();
  }

  // BUSINESS & ANALYTICS
  static async getBusinessProfile() {
    const res = await fetch(`${API_BASE}/business`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch business profile');
    return res.json();
  }

  static async updateBusinessProfile(data: any) {
    const res = await fetch(`${API_BASE}/business`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update business');
    return res.json();
  }

  static async updateWorkingHours(workingHours: any[]) {
    const res = await fetch(`${API_BASE}/business/working-hours`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ workingHours }),
    });
    if (!res.ok) throw new Error('Failed to update working hours');
    return res.json();
  }

  static async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`, { headers: this.getHeaders(true) });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  }

  // FAQS
  static async getFaqs() {
    const res = await fetch(`${API_BASE}/faqs`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch FAQs');
    return res.json();
  }

  static async createFaq(data: any) {
    const res = await fetch(`${API_BASE}/faqs`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create FAQ');
    return res.json();
  }

  static async updateFaq(id: string, data: any) {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update FAQ');
    return res.json();
  }

  static async deleteFaq(id: string) {
    const res = await fetch(`${API_BASE}/faqs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete FAQ');
    return res.json();
  }
}
