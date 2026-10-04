import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class CustomerService {
  static async listCustomers() {
    return prisma.customer.findMany({
      include: {
        appointments: {
          include: { service: true },
          orderBy: { date: 'desc' },
        },
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { date: 'desc' },
        },
        conversations: {
          include: { messages: true, handoff: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  static async findOrCreateCustomer(data: { name: string; phone: string; email?: string; notes?: string }) {
    const cleanPhone = data.phone.trim();
    let customer = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name.trim(),
          phone: cleanPhone,
          email: data.email?.trim() || null,
          notes: data.notes || null,
        },
      });
    } else {
      // Update name/email if provided
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: data.name.trim() || customer.name,
          email: data.email?.trim() || customer.email,
        },
      });
    }

    return customer;
  }

  static async updateCustomer(id: string, data: { name?: string; phone?: string; email?: string; notes?: string }) {
    await this.getCustomerById(id);
    return prisma.customer.update({
      where: { id },
      data,
    });
  }
}
