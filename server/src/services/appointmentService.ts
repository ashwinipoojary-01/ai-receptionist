import { prisma } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { CustomerService } from './customerService.js';
import { BusinessService } from './businessService.js';

export class AppointmentService {
  /**
   * Calculate available time slots for a given date and service
   */
  static async checkAvailability(dateStr: string, serviceId?: string) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new AppError('Invalid date format. Expected YYYY-MM-DD', 400);
    }

    const business = await BusinessService.getBusinessProfile();
    const dateObj = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = dateObj.getUTCDay();

    const workingHour = business.workingHours.find((w) => w.dayOfWeek === dayOfWeek);
    if (!workingHour || workingHour.isClosed) {
      return {
        date: dateStr,
        dayOfWeek,
        dayName: workingHour?.dayName || 'Unknown',
        isClosed: true,
        message: 'The clinic is closed on this day.',
        availableSlots: [],
      };
    }

    // Determine slot duration
    let slotDuration = 30;
    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service) slotDuration = service.duration;
    }

    // Parse open and close times
    const [openH, openM] = workingHour.openTime.split(':').map(Number);
    const [closeH, closeM] = workingHour.closeTime.split(':').map(Number);

    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Fetch existing appointments on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        date: dateStr,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    const bookedIntervals = existingAppointments.map((app) => {
      const [sH, sM] = app.startTime.split(':').map(Number);
      const [eH, eM] = app.endTime.split(':').map(Number);
      return {
        start: sH * 60 + sM,
        end: eH * 60 + eM,
      };
    });

    const availableSlots: string[] = [];

    for (let cur = openMinutes; cur + slotDuration <= closeMinutes; cur += 30) {
      const slotEnd = cur + slotDuration;
      // Check collision
      const isOverlapping = bookedIntervals.some(
        (b) => Math.max(cur, b.start) < Math.min(slotEnd, b.end)
      );

      if (!isOverlapping) {
        const hh = String(Math.floor(cur / 60)).padStart(2, '0');
        const mm = String(cur % 60).padStart(2, '0');
        availableSlots.push(`${hh}:${mm}`);
      }
    }

    return {
      date: dateStr,
      dayOfWeek,
      dayName: workingHour.dayName,
      isClosed: false,
      workingHours: `${workingHour.openTime} - ${workingHour.closeTime}`,
      availableSlots,
    };
  }

  /**
   * Book a verified appointment with strict collision checks
   */
  static async bookAppointment(params: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceId: string;
    date: string;
    startTime: string;
    notes?: string;
  }) {
    const { customerName, customerPhone, customerEmail, serviceId, date, startTime, notes } = params;

    if (!customerName || !customerPhone || !serviceId || !date || !startTime) {
      throw new AppError('Missing required booking details', 400);
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new AppError('Service not found', 404);

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + service.duration;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    // Verify availability
    const availability = await this.checkAvailability(date, serviceId);
    if (availability.isClosed) {
      throw new AppError('Cannot book appointment: Business is closed on this date.', 400);
    }

    if (!availability.availableSlots.includes(startTime)) {
      throw new AppError(`Time slot ${startTime} on ${date} is already booked or unavailable.`, 409);
    }

    // Find or create customer
    const customer = await CustomerService.findOrCreateCustomer({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });

    // Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        serviceId: service.id,
        date,
        startTime,
        endTime,
        status: 'CONFIRMED',
        notes: notes || null,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    // Create Notification record for Reception staff
    await prisma.notification.create({
      data: {
        title: `New Appointment: ${customer.name}`,
        message: `${customer.name} booked a ${service.name} on ${date} at ${startTime}.`,
        type: 'APPOINTMENT',
        metadata: JSON.stringify({ appointmentId: appointment.id, date, startTime }),
      },
    });

    return appointment;
  }

  /**
   * Reschedule an existing appointment
   */
  static async rescheduleAppointment(appointmentId: string, newDate: string, newStartTime: string) {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, customer: true },
    });

    if (!existing) throw new AppError('Appointment not found', 404);

    const availability = await this.checkAvailability(newDate, existing.serviceId);
    if (availability.isClosed) {
      throw new AppError('Cannot reschedule: Business is closed on this date.', 400);
    }

    if (!availability.availableSlots.includes(newStartTime)) {
      throw new AppError(`Time slot ${newStartTime} on ${newDate} is already booked or unavailable.`, 409);
    }

    const [h, m] = newStartTime.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + existing.service.duration;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const newEndTime = `${endH}:${endM}`;

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'CONFIRMED',
      },
      include: { service: true, customer: true },
    });

    await prisma.notification.create({
      data: {
        title: `Rescheduled: ${existing.customer.name}`,
        message: `Appointment for ${existing.customer.name} was moved to ${newDate} at ${newStartTime}.`,
        type: 'APPOINTMENT',
      },
    });

    return updated;
  }

  /**
   * Cancel an existing appointment
   */
  static async cancelAppointment(appointmentId: string, reason?: string) {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true, service: true },
    });

    if (!existing) throw new AppError('Appointment not found', 404);

    const cancelled = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${existing.notes || ''} [Cancelled: ${reason}]`.trim() : existing.notes,
      },
      include: { customer: true, service: true },
    });

    await prisma.notification.create({
      data: {
        title: `Appointment Cancelled: ${existing.customer.name}`,
        message: `Appointment on ${existing.date} at ${existing.startTime} was cancelled.`,
        type: 'APPOINTMENT',
      },
    });

    return cancelled;
  }

  static async listAppointments(filters?: { date?: string; customerId?: string; status?: string }) {
    return prisma.appointment.findMany({
      where: {
        ...(filters?.date && { date: filters.date }),
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status as any }),
      },
      include: {
        customer: true,
        service: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  static async updateAppointmentStatus(id: string, status: any) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: { customer: true, service: true },
    });
  }
}
