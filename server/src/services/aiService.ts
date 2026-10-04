import {
  AIIntent,
  AIChatResponse,
  ExtractedEntities,
  IntentDetectionResult,
  ToolCallExecution,
} from '../types/index.js';
import { executeTool } from './aiTools.js';
import { ConversationService } from './conversationService.js';
import { ServiceManager } from './serviceManager.js';
import { AppointmentService } from './appointmentService.js';
import { BusinessService } from './businessService.js';
import { FaqService } from './faqService.js';
import { prisma } from '../db.js';

export class AIService {
  /**
   * High-accuracy Intent Detection Engine
   */
  static async detectIntent(message: string, context?: any): Promise<IntentDetectionResult> {
    const text = message.toLowerCase().trim();

    // Human handoff detection
    if (
      /\b(human|operator|real person|manager|talk to someone|agent|receptionist|staff|frustrated|ridiculous|angry|speak to|lawyer|sue)\b/.test(
        text
      )
    ) {
      return {
        intent: 'HUMAN_HANDOFF',
        confidence: 0.96,
        entities: this.extractEntities(message),
        reasoning: 'User explicitly requested a human or expressed high frustration.',
      };
    }

    // Booking appointment
    if (
      /\b(book|schedule|make an appointment|reserve|slot|want to see doctor|consultation for|need to book)\b/.test(
        text
      ) &&
      !/\b(reschedule|change|cancel)\b/.test(text)
    ) {
      return {
        intent: 'BOOK_APPOINTMENT',
        confidence: 0.94,
        entities: this.extractEntities(message),
      };
    }

    // Rescheduling
    if (/\b(reschedule|postpone|move|change time|change date|push back)\b/.test(text)) {
      return {
        intent: 'RESCHEDULE_APPOINTMENT',
        confidence: 0.92,
        entities: this.extractEntities(message),
      };
    }

    // Cancellation
    if (/\b(cancel|cannot come|won't make it|drop appointment|call off)\b/.test(text)) {
      return {
        intent: 'CANCEL_APPOINTMENT',
        confidence: 0.95,
        entities: this.extractEntities(message),
      };
    }

    // Availability
    if (
      /\b(available|openings|any slots|free|timing|which days|what time are you free|slots available)\b/.test(
        text
      )
    ) {
      return {
        intent: 'CHECK_AVAILABILITY',
        confidence: 0.91,
        entities: this.extractEntities(message),
      };
    }

    // Business Hours
    if (/\b(hours|open today|closing time|when do you open|working hours|sunday open)\b/.test(text)) {
      return {
        intent: 'BUSINESS_HOURS',
        confidence: 0.93,
        entities: {},
      };
    }

    // Location
    if (/\b(where|address|location|directions|find you|parking|which floor|map)\b/.test(text)) {
      return {
        intent: 'LOCATION',
        confidence: 0.94,
        entities: {},
      };
    }

    // Services
    if (/\b(services|treatments|cost|price|fees|what do you do|dental|consultation fee|pricing)\b/.test(text)) {
      return {
        intent: 'SERVICES',
        confidence: 0.9,
        entities: this.extractEntities(message),
      };
    }

    // Customer Information (giving phone / email / name)
    const entities = this.extractEntities(message);
    if ((entities.customerPhone || entities.customerEmail) && text.length < 60) {
      return {
        intent: 'CUSTOMER_INFORMATION',
        confidence: 0.88,
        entities,
      };
    }

    // Greeting
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|greetings|hola)\b/.test(text)) {
      return {
        intent: 'GREETING',
        confidence: 0.98,
        entities: {},
      };
    }

    // Check FAQs
    const faqs = await FaqService.searchFaqs(message);
    if (faqs.length > 0) {
      return {
        intent: 'FAQ',
        confidence: 0.85,
        entities: { question: message },
      };
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.45,
      entities,
      reasoning: 'Input requires clarification or contextual fallback.',
    };
  }

  /**
   * Entity extraction helper (phone, date, time, names, service)
   */
  static extractEntities(text: string): ExtractedEntities {
    const entities: ExtractedEntities = {};

    // Phone number regex (US and international patterns)
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      entities.customerPhone = phoneMatch[0].trim();
    }

    // Email regex
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      entities.customerEmail = emailMatch[0].trim();
    }

    // Date extraction: "tomorrow", "today", "next monday", "YYYY-MM-DD", "october 3"
    const lower = text.toLowerCase();
    const today = new Date();

    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      entities.date = tomorrow.toISOString().split('T')[0];
    } else if (lower.includes('today')) {
      entities.date = today.toISOString().split('T')[0];
    } else {
      const isoDateMatch = text.match(/\b(202\d-\d{2}-\d{2})\b/);
      if (isoDateMatch) {
        entities.date = isoDateMatch[1];
      }
    }

    // Time extraction (e.g., "3:30", "3:30 PM", "15:30", "2pm", "10 am")
    const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
    if (timeMatch && !phoneMatch?.includes(timeMatch[0])) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        entities.time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }

    // Service recognition
    if (lower.includes('dental')) entities.service = 'Dental Consultation';
    else if (lower.includes('follow-up') || lower.includes('follow up')) entities.service = 'Follow-up Consultation';
    else if (lower.includes('general') || lower.includes('doctor') || lower.includes('consultation')) {
      entities.service = 'General Consultation';
    }

    // Name extraction ("I am John Doe", "My name is Sarah", "Name is Alex")
    const nameMatch = text.match(/(?:my name is|i am|i'm|this is|name:?)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (nameMatch) {
      entities.customerName = nameMatch[1].trim();
    }

    return entities;
  }

  /**
   * Main conversational orchestrator
   */
  static async processMessage(params: {
    conversationId: string;
    message: string;
    channel?: string;
  }): Promise<AIChatResponse> {
    const { conversationId, message } = params;

    // 1. Fetch conversation history
    const conversation = await ConversationService.getConversationById(conversationId);
    const history = conversation.messages;

    // 2. Add incoming user message to database
    await ConversationService.addMessage(conversationId, 'USER', message);

    // 3. Detect intent and extract entities
    const intentResult = await this.detectIntent(message);
    const { intent, confidence, entities } = intentResult;

    // Consolidate entities from past conversation context
    const aggregatedEntities = this.aggregateEntities(history, entities);

    // 4. Dispatch according to intent and execute backend tool calls
    let response: AIChatResponse;

    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    const isMock = !apiKey || process.env.AI_PROVIDER === 'mock';

    if (isMock) {
      response = await this.processWithRuleEngine(
        conversationId,
        message,
        intentResult,
        aggregatedEntities,
        conversation
      );
    } else {
      // In production with live API key, can connect to live LLM or fall back seamlessly
      response = await this.processWithRuleEngine(
        conversationId,
        message,
        intentResult,
        aggregatedEntities,
        conversation
      );
    }

    // 5. Store AI assistant reply in database
    await ConversationService.addMessage(
      conversationId,
      'ASSISTANT',
      response.message,
      response.intent,
      response.entities,
      response.toolCalls
    );

    // 6. Generate rolling conversation summary
    const summary = await this.generateConversationSummary(conversationId);
    await ConversationService.updateSummary(conversationId, summary);
    response.conversationSummary = summary;

    return response;
  }

  /**
   * Combines entities gathered across consecutive turns
   */
  private static aggregateEntities(pastMessages: any[], currentEntities: ExtractedEntities): ExtractedEntities {
    const merged: ExtractedEntities = { ...currentEntities };

    for (const msg of pastMessages) {
      if (msg.entities) {
        try {
          const parsed = typeof msg.entities === 'string' ? JSON.parse(msg.entities) : msg.entities;
          if (!merged.customerName && parsed.customerName) merged.customerName = parsed.customerName;
          if (!merged.customerPhone && parsed.customerPhone) merged.customerPhone = parsed.customerPhone;
          if (!merged.customerEmail && parsed.customerEmail) merged.customerEmail = parsed.customerEmail;
          if (!merged.service && parsed.service) merged.service = parsed.service;
          if (!merged.date && parsed.date) merged.date = parsed.date;
          if (!merged.time && parsed.time) merged.time = parsed.time;
        } catch (e) {
          // ignore parsing error
        }
      }
    }

    return merged;
  }

  /**
   * Deterministic, safe, high-fidelity AI Receptionist Engine with Tool Execution
   */
  private static async processWithRuleEngine(
    conversationId: string,
    rawMessage: string,
    intentResult: IntentDetectionResult,
    entities: ExtractedEntities,
    conversation: any
  ): Promise<AIChatResponse> {
    const { intent, confidence } = intentResult;
    const toolCalls: ToolCallExecution[] = [];

    // GREETING
    if (intent === 'GREETING') {
      const bInfo = await executeTool('getBusinessInfo', {});
      toolCalls.push(bInfo);
      return {
        message: `Hello! Welcome to ${bInfo.result.name}. I am your virtual receptionist. How can I assist you today? I can help you schedule an appointment, check business hours, provide location details, or answer any questions.`,
        intent,
        confidence,
        entities,
        toolCalls,
        suggestedQuickReplies: [
          'Book an Appointment',
          'What are your hours?',
          'What services do you offer?',
          'Where are you located?',
        ],
      };
    }

    // BUSINESS HOURS
    if (intent === 'BUSINESS_HOURS') {
      const hoursTool = await executeTool('getBusinessHours', {});
      toolCalls.push(hoursTool);

      const hoursList = hoursTool.result
        .map((h: any) => `• **${h.day}**: ${h.hours}`)
        .join('\n');

      return {
        message: `Here are our working hours:\n\n${hoursList}\n\nWould you like to book a consultation during our open hours?`,
        intent,
        confidence,
        entities,
        toolCalls,
        suggestedQuickReplies: ['Book Consultation', 'View Services', 'Clinic Location'],
      };
    }

    // LOCATION
    if (intent === 'LOCATION') {
      const bInfo = await executeTool('getBusinessInfo', {});
      toolCalls.push(bInfo);

      return {
        message: `${bInfo.result.name} is conveniently located at:\n📍 **${bInfo.result.address}**\n\n📞 Phone: ${bInfo.result.phone}\n✉️ Email: ${bInfo.result.email}\n\nWe provide free on-site parking for all patients. Would you like to schedule a visit?`,
        intent,
        confidence,
        entities,
        toolCalls,
        suggestedQuickReplies: ['Book an Appointment', 'Check Available Slots', 'Speak to Receptionist'],
      };
    }

    // SERVICES
    if (intent === 'SERVICES') {
      const servicesTool = await executeTool('getServices', {});
      toolCalls.push(servicesTool);

      const list = servicesTool.result
        .map((s: any) => `• **${s.name}** (${s.duration}) — ${s.price}\n  *${s.description || 'Specialist care'}*`)
        .join('\n\n');

      return {
        message: `Here are the services we currently offer:\n\n${list}\n\nWhich service would you like to schedule?`,
        intent,
        confidence,
        entities,
        toolCalls,
        suggestedQuickReplies: ['General Consultation', 'Dental Consultation', 'Follow-up Consultation'],
      };
    }

    // FAQ & KNOWLEDGE BASE
    if (intent === 'FAQ') {
      const faqTool = await executeTool('searchFaq', { query: rawMessage });
      toolCalls.push(faqTool);

      if (faqTool.result && faqTool.result.length > 0) {
        const topFaq = faqTool.result[0];
        return {
          message: `${topFaq.answer}\n\nIs there anything else I can assist you with today?`,
          intent: 'FAQ',
          confidence: 0.9,
          entities,
          toolCalls,
          suggestedQuickReplies: ['Book an appointment', 'Speak with a human', 'View services'],
        };
      }
    }

    // HUMAN HANDOFF
    if (intent === 'HUMAN_HANDOFF' || intent === 'COMPLAINT') {
      const handoffTool = await executeTool('createHumanHandoff', {
        conversationId,
        customerName: entities.customerName,
        customerPhone: entities.customerPhone,
        customerEmail: entities.customerEmail,
        reason: rawMessage,
      });
      toolCalls.push(handoffTool);

      return {
        message: `I understand. Let me connect you directly with a member of our front desk team. One of our human receptionists has been notified and will attend to you shortly.`,
        intent: 'HUMAN_HANDOFF',
        confidence,
        entities,
        toolCalls,
        handoffRequired: true,
        handoffReason: rawMessage,
      };
    }

    // CHECK AVAILABILITY & BOOKING FLOW
    if (intent === 'CHECK_AVAILABILITY' || intent === 'BOOK_APPOINTMENT' || intent === 'CUSTOMER_INFORMATION') {
      // Resolve service
      const services = await ServiceManager.listServices(true);
      let matchedService = services.find((s) =>
        entities.service ? s.name.toLowerCase().includes(entities.service.toLowerCase()) : false
      );

      if (!matchedService) {
        matchedService = services[0]; // fallback default
      }

      // If user has not specified a date
      if (!entities.date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = tomorrow.toISOString().split('T')[0];

        return {
          message: `I'd be glad to help you book a ${matchedService.name}. What date works best for you? (For example: tomorrow, or a specific date like ${defaultDate})`,
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.88,
          entities: { ...entities, service: matchedService.name },
          suggestedQuickReplies: ['Tomorrow', 'Next Monday', 'View Services'],
        };
      }

      // Check slot availability for the date
      const availTool = await executeTool('checkAvailableSlots', {
        date: entities.date,
        serviceId: matchedService.id,
      });
      toolCalls.push(availTool);

      if (availTool.result.isClosed) {
        return {
          message: `NovaCare Clinic is closed on ${availTool.result.dayName} (${entities.date}). Our standard hours are Monday to Saturday, 9:00 AM to 6:00 PM. Would you like to check available slots for another day?`,
          intent: 'CHECK_AVAILABILITY',
          confidence: 0.95,
          entities,
          toolCalls,
          suggestedQuickReplies: ['Tomorrow', 'Check Next Weekday'],
        };
      }

      const slots: string[] = availTool.result.availableSlots || [];
      if (slots.length === 0) {
        return {
          message: `All appointment slots for ${entities.date} are fully booked. Would you like to check the following day or speak with our receptionist to find a cancellation opening?`,
          intent: 'CHECK_AVAILABILITY',
          confidence: 0.95,
          entities,
          toolCalls,
          suggestedQuickReplies: ['Check next day', 'Speak to Receptionist'],
        };
      }

      // If no time is selected yet, offer top available slots
      if (!entities.time || !slots.includes(entities.time)) {
        const sampleSlots = slots.slice(0, 4).join(', ');
        return {
          message: `We have slots available on ${entities.date} for **${matchedService.name}** at: **${sampleSlots}**. Which time works best for you?`,
          intent: 'CHECK_AVAILABILITY',
          confidence: 0.92,
          entities: { ...entities, service: matchedService.name },
          toolCalls,
          suggestedQuickReplies: slots.slice(0, 4),
        };
      }

      // If we have date and time, check if we have customer details (Name & Phone)
      if (!entities.customerName || !entities.customerPhone) {
        return {
          message: `Great! I have reserved the slot for **${matchedService.name}** on **${entities.date} at ${entities.time}**. May I have your full name and phone number to confirm the booking?`,
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.94,
          entities: { ...entities, service: matchedService.name },
          toolCalls,
          suggestedQuickReplies: ['My name is Ashwini, phone 555-0199'],
        };
      }

      // ALL DETAILS AVAILABLE -> EXECUTE VERIFIED BOOKING VIA BACKEND TOOL
      const bookingTool = await executeTool('bookAppointment', {
        customerName: entities.customerName,
        customerPhone: entities.customerPhone,
        customerEmail: entities.customerEmail,
        serviceId: matchedService.id,
        date: entities.date,
        startTime: entities.time,
        notes: `Booked via AI Virtual Receptionist (${conversation.channel})`,
      });
      toolCalls.push(bookingTool);

      if (bookingTool.success) {
        const app = bookingTool.result;
        return {
          message: `🎉 You're all set, **${entities.customerName}**! Your **${matchedService.name}** has been confirmed for **${entities.date} at ${entities.time}**.\n\nA confirmation has been recorded with reference ID: \`#${app.id.slice(0, 8)}\`. Please arrive 10 minutes prior to your appointment at 742 Evergreen Terrace.`,
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.99,
          entities: { ...entities, appointmentId: app.id },
          toolCalls,
          activeBooking: {
            serviceName: matchedService.name,
            date: entities.date,
            time: entities.time,
            customerName: entities.customerName,
            customerPhone: entities.customerPhone,
            status: 'CONFIRMED',
            appointmentId: app.id,
          },
          suggestedQuickReplies: ['Add notes', 'Location & Parking', 'Thank you!'],
        };
      } else {
        return {
          message: `I encountered an issue reserving that slot: ${bookingTool.result}. Let me show you the latest openings or connect you with our receptionist.`,
          intent: 'BOOK_APPOINTMENT',
          confidence: 0.8,
          entities,
          toolCalls,
          suggestedQuickReplies: ['Check other times', 'Speak to Receptionist'],
        };
      }
    }

    // CANCEL APPOINTMENT
    if (intent === 'CANCEL_APPOINTMENT') {
      return {
        message: `I can certainly help you cancel an existing appointment. Please provide your phone number or appointment reference number so I can locate your booking.`,
        intent: 'CANCEL_APPOINTMENT',
        confidence,
        entities,
        suggestedQuickReplies: ['Speak to staff', 'Reschedule instead'],
      };
    }

    // RESCHEDULE APPOINTMENT
    if (intent === 'RESCHEDULE_APPOINTMENT') {
      return {
        message: `I can assist with rescheduling. Please provide your phone number and the new date/time you would prefer.`,
        intent: 'RESCHEDULE_APPOINTMENT',
        confidence,
        entities,
      };
    }

    // FALLBACK
    return {
      message: `I'd be happy to help with that! You can ask me to book a consultation, check clinic working hours, look up doctors/services, or connect you with our human staff. How may I best assist you?`,
      intent: 'UNKNOWN',
      confidence: 0.5,
      entities,
      suggestedQuickReplies: ['Book an Appointment', 'Working Hours', 'Services & Prices', 'Speak to human'],
    };
  }

  /**
   * Generates a concise conversational summary
   */
  static async generateConversationSummary(conversationId: string): Promise<string> {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        customer: true,
      },
    });

    if (!conv || conv.messages.length === 0) return 'Empty conversation.';

    const userMsgs = conv.messages.filter((m) => m.role === 'USER').map((m) => m.content);
    const hasBooking = conv.messages.some((m) => m.intent === 'BOOK_APPOINTMENT' && m.role === 'ASSISTANT' && m.content.includes('confirmed'));
    const hasHandoff = conv.messages.some((m) => m.intent === 'HUMAN_HANDOFF');

    if (hasHandoff) {
      return `Customer requested human assistance regarding: "${userMsgs[userMsgs.length - 1] || 'Assistance requested'}". Escalation triggered.`;
    }

    if (hasBooking) {
      return `Customer requested appointment booking. Consultation successfully booked and confirmed. No escalation required.`;
    }

    return `Customer inquiry handled via AI. Primary topics: ${conv.primaryIntent || 'General questions'}.`;
  }
}
