import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class ServiceManager {
  static async listServices(onlyActive = false) {
    return prisma.service.findMany({
      where: onlyActive ? { active: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  static async getServiceById(id: string) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) throw new AppError('Service not found', 404);
    return service;
  }

  static async createService(data: { name: string; description?: string; duration: number; price?: number; active?: boolean }) {
    const business = await prisma.business.findFirst();
    if (!business) throw new AppError('Business record must exist first', 400);

    return prisma.service.create({
      data: {
        businessId: business.id,
        name: data.name,
        description: data.description || '',
        duration: Number(data.duration),
        price: Number(data.price || 0),
        active: data.active !== undefined ? data.active : true,
      },
    });
  }

  static async updateService(id: string, data: Partial<{ name: string; description: string; duration: number; price: number; active: boolean }>) {
    await this.getServiceById(id);
    return prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration !== undefined && { duration: Number(data.duration) }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.active !== undefined && { active: data.active }),
      },
    });
  }

  static async deleteService(id: string) {
    await this.getServiceById(id);
    return prisma.service.delete({ where: { id } });
  }
}
