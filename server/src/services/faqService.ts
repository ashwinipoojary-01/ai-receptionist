import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class FaqService {
  static async listFaqs(onlyActive = false) {
    return prisma.faq.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createFaq(data: { question: string; answer: string; category?: string; active?: boolean }) {
    const business = await prisma.business.findFirst();
    if (!business) throw new AppError('Business record not found', 400);

    return prisma.faq.create({
      data: {
        businessId: business.id,
        question: data.question.trim(),
        answer: data.answer.trim(),
        category: data.category?.trim() || 'General',
        active: data.active !== undefined ? data.active : true,
      },
    });
  }

  static async updateFaq(id: string, data: Partial<{ question: string; answer: string; category: string; active: boolean }>) {
    return prisma.faq.update({
      where: { id },
      data,
    });
  }

  static async deleteFaq(id: string) {
    return prisma.faq.delete({ where: { id } });
  }

  /**
   * Simple keyword/semantic relevance match for FAQs
   */
  static async searchFaqs(query: string) {
    const all = await this.listFaqs(true);
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = all.map((faq) => {
      let score = 0;
      const qLower = faq.question.toLowerCase();
      const aLower = faq.answer.toLowerCase();

      for (const t of tokens) {
        if (qLower.includes(t)) score += 3;
        if (aLower.includes(t)) score += 1;
      }

      return { faq, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.faq);
  }
}
