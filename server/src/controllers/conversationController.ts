import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../services/conversationService.js';
import { z } from 'zod';

const handoffUpdateSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED']),
  resolutionNote: z.string().optional(),
});

export class ConversationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const conversations = await ConversationService.listConversations();
      return res.json({ conversations });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const conversation = await ConversationService.getConversationById(req.params.id);
      return res.json({ conversation });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { channel, customerId } = req.body;
      const conversation = await ConversationService.createConversation(channel, customerId);
      return res.status(201).json({ conversation });
    } catch (err) {
      next(err);
    }
  }

  static async listHandoffs(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as any;
      const handoffs = await ConversationService.listHandoffs(status);
      return res.json({ handoffs });
    } catch (err) {
      next(err);
    }
  }

  static async updateHandoff(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, resolutionNote } = handoffUpdateSchema.parse(req.body);
      const updated = await ConversationService.updateHandoffStatus(req.params.id, status, resolutionNote);
      return res.json({ handoff: updated });
    } catch (err) {
      next(err);
    }
  }
}
