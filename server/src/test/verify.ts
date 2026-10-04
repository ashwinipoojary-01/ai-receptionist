import { AIService } from '../services/aiService.js';
import { AppointmentService } from '../services/appointmentService.js';
import { CustomerService } from '../services/customerService.js';
import { ServiceManager } from '../services/serviceManager.js';
import { prisma } from '../db.js';

async function runTests() {
  console.log('🧪 Starting AI Receptionist Automated Test Verification...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Intent Detection & Entity Extraction
  try {
    const query = 'Hi, I need to book a General Consultation for tomorrow at 2:00 PM. My name is Alex';
    const result = await AIService.detectIntent(query);

    if (
      result.intent === 'BOOK_APPOINTMENT' &&
      result.confidence >= 0.85 &&
      result.entities.customerName === 'Alex' &&
      result.entities.time === '14:00' &&
      result.entities.service === 'General Consultation'
    ) {
      console.log('✅ Test 1 Passed: Intent detection & entity extraction for booking');
      passed++;
    } else {
      throw new Error(`Unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message);
    failed++;
  }

  // Test 2: Human Escalation Trigger
  try {
    const query = 'This is ridiculous, let me speak with a real human manager right now';
    const result = await AIService.detectIntent(query);

    if (result.intent === 'HUMAN_HANDOFF' && result.confidence >= 0.9) {
      console.log('✅ Test 2 Passed: Escalation detection on user frustration / explicit request');
      passed++;
    } else {
      throw new Error(`Unexpected intent: ${result.intent}`);
    }
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message);
    failed++;
  }

  // Test 3: Appointment Booking & Collision Prevention
  try {
    const services = await ServiceManager.listServices(true);
    const sampleServiceId = services[0]?.id;
    if (!sampleServiceId) throw new Error('No services in database');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const availability = await AppointmentService.checkAvailability(dateStr, sampleServiceId);

    if (!availability.isClosed && availability.availableSlots.length > 0) {
      const chosenSlot = availability.availableSlots[0];

      // 1st Booking
      const appointment = await AppointmentService.bookAppointment({
        customerName: 'Automated Test Patient',
        customerPhone: '+1 (555) 000-7788',
        serviceId: sampleServiceId,
        date: dateStr,
        startTime: chosenSlot,
      });

      if (!appointment.id) throw new Error('Appointment creation failed');

      // 2nd Booking (Should throw double booking error)
      let collisionPrevented = false;
      try {
        await AppointmentService.bookAppointment({
          customerName: 'Second Overlapping Patient',
          customerPhone: '+1 (555) 000-9999',
          serviceId: sampleServiceId,
          date: dateStr,
          startTime: chosenSlot,
        });
      } catch (colErr: any) {
        collisionPrevented = true;
      }

      if (collisionPrevented) {
        console.log('✅ Test 3 Passed: Appointment booking & double-booking prevention');
        passed++;
      } else {
        throw new Error('Collision check failed - double booking was permitted!');
      }

      // Cleanup
      await prisma.appointment.delete({ where: { id: appointment.id } });
    } else {
      console.log('⚠️ Test 3 Skipped (Clinic closed on test day)');
    }
  } catch (err: any) {
    console.error('❌ Test 3 Failed:', err.message);
    failed++;
  }

  // Test 4: Customer Lookup & Deduplication
  try {
    const testPhone = '+1 (555) 123-4567';
    const c1 = await CustomerService.findOrCreateCustomer({
      name: 'Integration User A',
      phone: testPhone,
      email: 'usera@example.com',
    });

    const c2 = await CustomerService.findOrCreateCustomer({
      name: 'Integration User A Updated',
      phone: testPhone,
    });

    if (c1.id === c2.id && c2.name === 'Integration User A Updated') {
      console.log('✅ Test 4 Passed: Customer profile phone deduplication & lookup');
      passed++;
    } else {
      throw new Error('Customer IDs did not match');
    }

    // Cleanup
    await prisma.customer.delete({ where: { id: c1.id } });
  } catch (err: any) {
    console.error('❌ Test 4 Failed:', err.message);
    failed++;
  }

  console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests().finally(() => prisma.$disconnect());
