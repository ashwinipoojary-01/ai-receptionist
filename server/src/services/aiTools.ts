import { BusinessService } from './businessService.js';
import { ServiceManager } from './serviceManager.js';
import { AppointmentService } from './appointmentService.js';
import { CustomerService } from './customerService.js';
import { FaqService } from './faqService.js';
import { ConversationService } from './conversationService.js';
import { ToolCallExecution } from '../types/index.js';

export const AI_TOOLS_REGISTRY: Record<string, {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (args: any) => Promise<any>;
}> = {
  getBusinessInfo: {
    name: 'getBusinessInfo',
    description: 'Retrieve official business name, tagline, address, phone, email, and description',
    parameters: {},
    execute: async () => {
      const b = await BusinessService.getBusinessProfile();
      return {
        name: b.name,
        tagline: b.tagline,
        phone: b.phone,
        email: b.email,
        address: b.address,
        website: b.website,
        description: b.description,
      };
    },
  },

  getBusinessHours: {
    name: 'getBusinessHours',
    description: 'Get schedule of working days, open times, and closed days',
    parameters: {},
    execute: async () => {
      const b = await BusinessService.getBusinessProfile();
      return b.workingHours.map((w) => ({
        day: w.dayName,
        hours: w.isClosed ? 'Closed' : `${w.openTime} - ${w.closeTime}`,
        isClosed: w.isClosed,
      }));
    },
  },

  getServices: {
    name: 'getServices',
    description: 'Retrieve list of available clinic services, durations in minutes, and consultation fees',
    parameters: {},
    execute: async () => {
      const services = await ServiceManager.listServices(true);
      return services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        duration: `${s.duration} mins`,
        price: `$${s.price.toFixed(2)}`,
      }));
    },
  },

  checkAvailableSlots: {
    name: 'checkAvailableSlots',
    description: 'Check actual available booking timeslots on a specific date for a service',
    parameters: {
      date: { type: 'string', description: 'Date in YYYY-MM-DD format (e.g., 2026-10-03)' },
      serviceId: { type: 'string', description: 'Optional Service ID' },
    },
    execute: async (args: { date: string; serviceId?: string }) => {
      return AppointmentService.checkAvailability(args.date, args.serviceId);
    },
  },

  bookAppointment: {
    name: 'bookAppointment',
    description: 'Create and confirm a verified appointment in the clinic schedule',
    parameters: {
      customerName: { type: 'string' },
      customerPhone: { type: 'string' },
      customerEmail: { type: 'string' },
      serviceId: { type: 'string' },
      date: { type: 'string', description: 'YYYY-MM-DD' },
      startTime: { type: 'string', description: 'HH:mm (e.g. 14:30)' },
      notes: { type: 'string' },
    },
    execute: async (args: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      serviceId: string;
      date: string;
      startTime: string;
      notes?: string;
    }) => {
      return AppointmentService.bookAppointment(args);
    },
  },

  rescheduleAppointment: {
    name: 'rescheduleAppointment',
    description: 'Reschedule an existing appointment to a new date and time',
    parameters: {
      appointmentId: { type: 'string' },
      newDate: { type: 'string' },
      newStartTime: { type: 'string' },
    },
    execute: async (args: { appointmentId: string; newDate: string; newStartTime: string }) => {
      return AppointmentService.rescheduleAppointment(args.appointmentId, args.newDate, args.newStartTime);
    },
  },

  cancelAppointment: {
    name: 'cancelAppointment',
    description: 'Cancel an existing appointment in the clinic system',
    parameters: {
      appointmentId: { type: 'string' },
      reason: { type: 'string' },
    },
    execute: async (args: { appointmentId: string; reason?: string }) => {
      return AppointmentService.cancelAppointment(args.appointmentId, args.reason);
    },
  },

  searchFaq: {
    name: 'searchFaq',
    description: 'Search official business knowledge base for questions and policy details',
    parameters: {
      query: { type: 'string' },
    },
    execute: async (args: { query: string }) => {
      return FaqService.searchFaqs(args.query);
    },
  },

  createHumanHandoff: {
    name: 'createHumanHandoff',
    description: 'Escalate the conversation to a human receptionist or duty manager',
    parameters: {
      conversationId: { type: 'string' },
      customerName: { type: 'string' },
      customerPhone: { type: 'string' },
      customerEmail: { type: 'string' },
      reason: { type: 'string' },
    },
    execute: async (args: {
      conversationId: string;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
      reason: string;
    }) => {
      return ConversationService.createHumanHandoff(args);
    },
  },
};

export async function executeTool(toolName: string, args: any): Promise<ToolCallExecution> {
  const tool = AI_TOOLS_REGISTRY[toolName];
  if (!tool) {
    return {
      toolName,
      args,
      result: `Tool '${toolName}' is not recognized.`,
      success: false,
    };
  }

  try {
    const result = await tool.execute(args);
    return {
      toolName,
      args,
      result,
      success: true,
    };
  } catch (err: any) {
    return {
      toolName,
      args,
      result: err.message || 'Tool execution failed',
      success: false,
    };
  }
}
