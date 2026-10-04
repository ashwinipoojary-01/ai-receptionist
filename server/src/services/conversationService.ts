import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class ConversationService {
  static async listConversations() {
    return prisma.conversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        handoff: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getConversationById(id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: {
          include: { appointments: { include: { service: true } } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        handoff: true,
      },
    });

    if (!conversation) throw new AppError('Conversation not found', 404);
    return conversation;
  }

  static async createConversation(channel = 'WEB_CHAT', customerId?: string) {
    return prisma.conversation.create({
      data: {
        channel,
        customerId: customerId || null,
        status: 'ACTIVE',
      },
      include: {
        customer: true,
        messages: true,
        handoff: true,
      },
    });
  }

  static async addMessage(conversationId: string, role: 'USER' | 'ASSISTANT' | 'SYSTEM', content: string, intent?: string, entities?: any, toolCalls?: any) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        intent: intent || null,
        entities: entities ? JSON.stringify(entities) : null,
        toolCalls: toolCalls ? JSON.stringify(toolCalls) : null,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        ...(intent ? { primaryIntent: intent } : {}),
      },
    });

    return message;
  }

  static async updateSummary(conversationId: string, summary: string, priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') {
    return prisma.conversation.update({
      where: { id: conversationId },
      data: {
        summary,
        ...(priority ? { priority } : {}),
      },
    });
  }

  static async createHumanHandoff(params: {
    conversationId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    reason: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) {
    const { conversationId, customerName, customerPhone, customerEmail, reason, priority = 'HIGH' } = params;

    const existing = await prisma.humanHandoff.findUnique({
      where: { conversationId },
    });

    let handoff;
    if (existing) {
      handoff = await prisma.humanHandoff.update({
        where: { conversationId },
        data: {
          reason,
          priority,
          status: 'NEW',
          customerName: customerName || existing.customerName,
          customerPhone: customerPhone || existing.customerPhone,
          customerEmail: customerEmail || existing.customerEmail,
        },
      });
    } else {
      handoff = await prisma.humanHandoff.create({
        data: {
          conversationId,
          customerName,
          customerPhone,
          customerEmail,
          reason,
          priority,
          status: 'NEW',
        },
      });
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ESCALATED', priority },
    });

    await prisma.notification.create({
      data: {
        title: `Human Escalation Requested: ${customerName || 'Visitor'}`,
        message: `Reason: ${reason}`,
        type: 'HANDOFF',
        metadata: JSON.stringify({ conversationId, handoffId: handoff.id }),
      },
    });

    return handoff;
  }

  static async listHandoffs(status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED') {
    return prisma.humanHandoff.findMany({
      where: status ? { status } : undefined,
      include: {
        conversation: {
          include: {
            messages: { orderBy: { createdAt: 'asc' } },
            customer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateHandoffStatus(id: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED', resolutionNote?: string) {
    return prisma.humanHandoff.update({
      where: { id },
      data: {
        status,
        ...(resolutionNote !== undefined ? { resolutionNote } : {}),
      },
    });
  }
}
