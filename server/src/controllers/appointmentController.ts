import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointmentService.js';
import { z } from 'zod';

const bookSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(3),
  customerEmail: z.string().email().optional(),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export class AppointmentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, customerId, status } = req.query;
      const appointments = await AppointmentService.listAppointments({
        date: date as string,
        customerId: customerId as string,
        status: status as string,
      });
      return res.json({ appointments });
    } catch (err) {
      next(err);
    }
  }

  static async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, serviceId } = req.query;
      if (!date) {
        return res.status(400).json({ error: 'Query parameter date (YYYY-MM-DD) is required' });
      }
      const availability = await AppointmentService.checkAvailability(
        date as string,
        serviceId as string | undefined
      );
      return res.json(availability);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = bookSchema.parse(req.body);
      const appointment = await AppointmentService.bookAppointment(data);
      return res.status(201).json({ appointment });
    } catch (err) {
      next(err);
    }
  }

  static async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { newDate, newStartTime } = rescheduleSchema.parse(req.body);
      const updated = await AppointmentService.rescheduleAppointment(id, newDate, newStartTime);
      return res.json({ appointment: updated });
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cancelled = await AppointmentService.cancelAppointment(id, reason);
      return res.json({ appointment: cancelled });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await AppointmentService.updateAppointmentStatus(id, status);
      return res.json({ appointment: updated });
    } catch (err) {
      next(err);
    }
  }
}
