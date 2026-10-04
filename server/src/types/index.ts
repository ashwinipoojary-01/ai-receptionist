export type Role = 'ADMIN' | 'STAFF';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type HandoffStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type AIIntent =
  | 'GREETING'
  | 'BUSINESS_HOURS'
  | 'LOCATION'
  | 'SERVICES'
  | 'FAQ'
  | 'BOOK_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'CANCEL_APPOINTMENT'
  | 'CHECK_AVAILABILITY'
  | 'CUSTOMER_INFORMATION'
  | 'COMPLAINT'
  | 'HUMAN_HANDOFF'
  | 'UNKNOWN';

export interface ExtractedEntities {
  service?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  appointmentId?: string;
  notes?: string;
  question?: string;
}

export interface IntentDetectionResult {
  intent: AIIntent;
  confidence: number;
  entities: ExtractedEntities;
  reasoning?: string;
}

export interface ToolCallExecution {
  toolName: string;
  args: Record<string, any>;
  result: any;
  success: boolean;
}

export interface AIChatResponse {
  message: string;
  intent: AIIntent;
  confidence: number;
  entities: ExtractedEntities;
  toolCalls?: ToolCallExecution[];
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
