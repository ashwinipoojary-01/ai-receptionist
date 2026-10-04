import { describe, it, expect } from 'vitest';
import { AIService } from '../services/aiService.js';
import { AppointmentService } from '../services/appointmentService.js';
import { CustomerService } from '../services/customerService.js';
import { ServiceManager } from '../services/serviceManager.js';
import { prisma } from '../db.js';

describe('AI Receptionist Core Logic Suite', () => {
  it('detects intent and extracts entities from natural booking query', async () => {
    const query = 'Hi, I need to book a General Consultation for tomorrow at 2:00 PM. My name is Alex';
    const result = await AIService.detectIntent(query);

    expect(result.intent).toBe('BOOK_APPOINTMENT');
    expect(result.confidence).toBeGreaterThan(0.85);
    expect(result.entities.customerName).toBe('Alex');
    expect(result.entities.time).toBe('14:00');
    expect(result.entities.service).toBe('General Consultation');
  });

  it('detects human escalation trigger on frustration or explicit request', async () => {
    const query = 'This is ridiculous, let me speak with a real human manager right now';
    const result = await AIService.detectIntent(query);

    expect(result.intent).toBe('HUMAN_HANDOFF');
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('checks appointment availability correctly and prevents collision', async () => {
    const services = await ServiceManager.listServices(true);
    const sampleServiceId = services[0]?.id;
    if (!sampleServiceId) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availability = await AppointmentService.checkAvailability(dateStr, sampleServiceId);
    expect(availability.date).toBe(dateStr);
    expect(Array.isArray(availability.availableSlots)).toBe(true);

    if (!availability.isClosed && availability.availableSlots.length > 0) {
      const chosenSlot = availability.availableSlots[0];

      // Book the slot
      const appointment = await AppointmentService.bookAppointment({
        customerName: 'Test Patient Unit',
        customerPhone: '+1 (555) 999-1122',
        serviceId: sampleServiceId,
        date: dateStr,
        startTime: chosenSlot,
      });

      expect(appointment.id).toBeDefined();
      expect(appointment.status).toBe('CONFIRMED');

      // Double booking collision check
      await expect(
        AppointmentService.bookAppointment({
          customerName: 'Second Patient',
          customerPhone: '+1 (555) 999-3344',
          serviceId: sampleServiceId,
          date: dateStr,
          startTime: chosenSlot,
        })
      ).rejects.toThrow(/already booked or unavailable/i);

      // Clean up
      await prisma.appointment.delete({ where: { id: appointment.id } });
    }
  });

  it('finds or creates a customer profile by phone number', async () => {
    const testPhone = '+1 (555) 777-8899';
    const customer = await CustomerService.findOrCreateCustomer({
      name: 'Integration Test User',
      phone: testPhone,
      email: 'testuser@example.com',
    });

    expect(customer.id).toBeDefined();
    expect(customer.name).toBe('Integration Test User');

    const sameCustomer = await CustomerService.findOrCreateCustomer({
      name: 'Integration Test User Updated',
      phone: testPhone,
    });

    expect(sameCustomer.id).toBe(customer.id);

    // Clean up
    await prisma.customer.delete({ where: { id: customer.id } });
  });
});
