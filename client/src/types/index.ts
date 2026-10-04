export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  createdAt?: string;
}

export interface WorkingHour {
  id: string;
  businessId: string;
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  active: boolean;
}

export interface Business {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  timezone: string;
  workingHours: WorkingHour[];
  services: Service[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  appointments?: Appointment[];
  conversations?: Conversation[];
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customer: Customer;
  serviceId: string;
  service: Service;
  date: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent?: string;
  entities?: string;
  toolCalls?: string;
  createdAt: string;
}

export interface HumanHandoff {
  id: string;
  conversationId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  reason: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNote?: string;
  createdAt: string;
  conversation?: Conversation;
}

export interface Conversation {
  id: string;
  customerId?: string;
  customer?: Customer;
  channel: 'WEB_CHAT' | 'VOICE';
  status: 'ACTIVE' | 'COMPLETED' | 'ESCALATED';
  primaryIntent?: string;
  confidence?: number;
  summary?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  messages: Message[];
  handoff?: HumanHandoff;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  businessId: string;
  category: string;
  question: string;
  answer: string;
  active: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  todayAppointments: number;
  totalAppointments: number;
  totalConversations: number;
  totalCustomers: number;
  pendingHandoffs: number;
  resolutionRate: number;
  intentsDistribution: Array<{ intent: string; count: number }>;
  recentAppointments: Appointment[];
  recentConversations: Conversation[];
}

export interface AIChatResponse {
  conversationId: string;
  message: string;
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  toolCalls?: Array<{ toolName: string; args: any; result: any; success: boolean }>;
  handoffRequired?: boolean;
  handoffReason?: string;
  suggestedQuickReplies?: string[];
  conversationSummary?: string;
  activeBooking?: {
    serviceName?: string;
    date?: string;
    time?: string;
    customerName?: string;
    customerPhone?: string;
    status?: string;
    appointmentId?: string;
  };
}
