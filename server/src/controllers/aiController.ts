import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { ConversationService } from '../services/conversationService.js';
import { z } from 'zod';

const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  channel: z.enum(['WEB_CHAT', 'VOICE']).default('WEB_CHAT'),
});

const intentSchema = z.object({
  message: z.string().min(1),
});

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, channel, conversationId: reqConvId } = chatSchema.parse(req.body);

      let conversationId = reqConvId;
      if (!conversationId) {
        const conv = await ConversationService.createConversation(channel);
        conversationId = conv.id;
      }

      const response = await AIService.processMessage({
        conversationId,
        message,
        channel,
      });

      return res.json({
        conversationId,
        ...response,
      });
    } catch (err) {
      next(err);
    }
  }

  static async detectIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = intentSchema.parse(req.body);
      const result = await AIService.detectIntent(message);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async summarize(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.body;
      if (!conversationId) {
        return res.status(400).json({ error: 'conversationId is required' });
      }
      const summary = await AIService.generateConversationSummary(conversationId);
      return res.json({ conversationId, summary });
    } catch (err) {
      next(err);
    }
  }
}
