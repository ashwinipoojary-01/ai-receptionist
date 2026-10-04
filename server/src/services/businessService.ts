import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

export class BusinessService {
  static async getBusinessProfile() {
    let business = await prisma.business.findFirst({
      include: {
        workingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        services: {
          where: { active: true },
        },
      },
    });

    if (!business) {
      business = await prisma.business.create({
        data: {
          name: 'NovaCare Clinic',
          tagline: 'Premier Healthcare & Specialist Clinic',
          description: 'Comprehensive medical consultations and specialized patient care available 24/7.',
          phone: '+1 (555) 234-5678',
          email: 'care@novacareclinic.com',
          address: '742 Evergreen Terrace, Suite 100, Springfield',
          website: 'https://novacareclinic.com',
          workingHours: {
            create: [
              { dayOfWeek: 0, dayName: 'Sunday', openTime: '09:00', closeTime: '17:00', isClosed: true },
              { dayOfWeek: 1, dayName: 'Monday', openTime: '09:00', closeTime: '18:00', isClosed: false },
              { dayOfWeek: 2, dayName: 'Tuesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
              { dayOfWeek: 3, dayName: 'Wednesday', openTime: '09:00', closeTime: '18:00', isClosed: false },
              { dayOfWeek: 4, dayName: 'Thursday', openTime: '09:00', closeTime: '18:00', isClosed: false },
              { dayOfWeek: 5, dayName: 'Friday', openTime: '09:00', closeTime: '18:00', isClosed: false },
              { dayOfWeek: 6, dayName: 'Saturday', openTime: '09:00', closeTime: '16:00', isClosed: false },
            ],
          },
          services: {
            create: [
              { name: 'General Consultation', description: 'Comprehensive physical assessment and diagnosis', duration: 30, price: 75.0, active: true },
              { name: 'Dental Consultation', description: 'Oral hygiene, cavity check & dental care planning', duration: 45, price: 120.0, active: true },
              { name: 'Follow-up Consultation', description: 'Review progress, test results and prescriptions', duration: 20, price: 45.0, active: true },
            ],
          },
        },
        include: {
          workingHours: { orderBy: { dayOfWeek: 'asc' } },
          services: { where: { active: true } },
        },
      });
    }

    return business;
  }

  static async updateBusiness(data: any) {
    const business = await this.getBusinessProfile();
    return prisma.business.update({
      where: { id: business.id },
      data: {
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        phone: data.phone,
        email: data.email,
        address: data.address,
        website: data.website,
        timezone: data.timezone,
      },
      include: {
        workingHours: { orderBy: { dayOfWeek: 'asc' } },
        services: true,
      },
    });
  }

  static async updateWorkingHours(workingHoursList: Array<{ id?: string; dayOfWeek: number; dayName: string; openTime: string; closeTime: string; isClosed: boolean }>) {
    const business = await this.getBusinessProfile();
    for (const item of workingHoursList) {
      const existing = await prisma.workingHour.findFirst({
        where: { businessId: business.id, dayOfWeek: item.dayOfWeek },
      });

      if (existing) {
        await prisma.workingHour.update({
          where: { id: existing.id },
          data: {
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
          },
        });
      } else {
        await prisma.workingHour.create({
          data: {
            businessId: business.id,
            dayOfWeek: item.dayOfWeek,
            dayName: item.dayName,
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
          },
        });
      }
    }

    return prisma.workingHour.findMany({
      where: { businessId: business.id },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
