import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI Receptionist database with NovaCare Clinic scenario...');

  // 1. Clean existing records in sequence
  await prisma.notification.deleteMany();
  await prisma.humanHandoff.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.workingHour.deleteMany();
  await prisma.business.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Evelyn Vance (Admin)',
      email: 'admin@novacareclinic.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('👤 Admin created:', admin.email);

  // 3. Create Business Entity
  const business = await prisma.business.create({
    data: {
      name: 'NovaCare Clinic',
      tagline: 'Premier Healthcare & Specialist Clinic',
      description: 'Comprehensive medical consultations, preventive health screenings, and dental care available 24/7.',
      phone: '+1 (555) 234-5678',
      email: 'care@novacareclinic.com',
      address: '742 Evergreen Terrace, Suite 100, Springfield',
      website: 'https://novacareclinic.com',
      timezone: 'America/New_York',
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
          {
            name: 'General Consultation',
            description: 'Comprehensive physical examination, vital signs, and diagnostic medical assessment.',
            duration: 30,
            price: 75.0,
            active: true,
          },
          {
            name: 'Dental Consultation',
            description: 'Oral cavity checkup, plaque evaluation, hygiene recommendations, and dental treatment planning.',
            duration: 45,
            price: 120.0,
            active: true,
          },
          {
            name: 'Follow-up Consultation',
            description: 'Progress evaluation, prescription review, and pathology report interpretation.',
            duration: 20,
            price: 45.0,
            active: true,
          },
        ],
      },
      faqs: {
        create: [
          {
            category: 'Hours & Timings',
            question: 'What are your consultation timings?',
            answer: 'Our consultations are available from 9:00 AM to 6:00 PM Monday through Friday, and 9:00 AM to 4:00 PM on Saturdays. We are closed on Sundays.',
            active: true,
          },
          {
            category: 'Appointments',
            question: 'How do I reschedule or cancel my appointment?',
            answer: 'You can reschedule or cancel anytime by talking to our AI Receptionist or contacting our front desk at +1 (555) 234-5678 at least 2 hours in advance.',
            active: true,
          },
          {
            category: 'Facilities',
            question: 'Is parking available on site?',
            answer: 'Yes! NovaCare Clinic has free dedicated parking for patients in front of Suite 100 with wheelchair access.',
            active: true,
          },
          {
            category: 'Insurance',
            question: 'Do you accept health insurance?',
            answer: 'We accept most major commercial health insurance policies (BlueCross, Aetna, Cigna, UnitedHealthcare) as well as direct card payments.',
            active: true,
          },
          {
            category: 'Emergencies',
            question: 'What should I do in an emergency?',
            answer: 'If you are experiencing a life-threatening medical emergency, please dial 911 immediately or go to the nearest emergency department.',
            active: true,
          },
        ],
      },
    },
    include: { services: true },
  });
  console.log('🏥 Business and services created.');

  // 4. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Ashwini Kumar',
      phone: '+1 (555) 432-1098',
      email: 'ashwini@example.com',
      notes: 'Prefers afternoon slots, recurring patient.',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Elena Rostova',
      phone: '+1 (555) 891-2345',
      email: 'elena.rostova@example.com',
      notes: 'Dental checkup regular.',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Marcus Chen',
      phone: '+1 (555) 678-9012',
      email: 'marcus.chen@example.com',
      notes: 'First-time visitor.',
    },
  });

  // 5. Create Appointments for Today and Tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  const genService = business.services.find((s) => s.name === 'General Consultation')!;
  const dentalService = business.services.find((s) => s.name === 'Dental Consultation')!;
  const followService = business.services.find((s) => s.name === 'Follow-up Consultation')!;

  await prisma.appointment.create({
    data: {
      customerId: customer1.id,
      serviceId: genService.id,
      date: today,
      startTime: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      notes: 'Routine health checkup',
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: customer2.id,
      serviceId: dentalService.id,
      date: today,
      startTime: '14:00',
      endTime: '14:45',
      status: 'CONFIRMED',
      notes: 'Deep cleaning and whitening assessment',
    },
  });

  await prisma.appointment.create({
    data: {
      customerId: customer3.id,
      serviceId: followService.id,
      date: tomorrow,
      startTime: '11:00',
      endTime: '11:20',
      status: 'CONFIRMED',
      notes: 'Follow-up on blood work',
    },
  });
  console.log('📅 Sample appointments created.');

  // 6. Create realistic past Conversations and Human Handoff
  const conv1 = await prisma.conversation.create({
    data: {
      customerId: customer1.id,
      channel: 'WEB_CHAT',
      status: 'COMPLETED',
      primaryIntent: 'BOOK_APPOINTMENT',
      confidence: 0.96,
      summary: 'Customer booked a General Consultation for today at 10:00 AM. Appointment confirmed.',
      priority: 'MEDIUM',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        role: 'USER',
        content: 'Hi, I need to book an appointment for today morning.',
        intent: 'BOOK_APPOINTMENT',
      },
      {
        conversationId: conv1.id,
        role: 'ASSISTANT',
        content: 'Of course! What service would you like to book?',
        intent: 'BOOK_APPOINTMENT',
      },
      {
        conversationId: conv1.id,
        role: 'USER',
        content: 'General consultation.',
        intent: 'BOOK_APPOINTMENT',
      },
      {
        conversationId: conv1.id,
        role: 'ASSISTANT',
        content: "We have 10:00 AM, 11:30 AM, and 2:00 PM available today. Which works best for you?",
        intent: 'CHECK_AVAILABILITY',
      },
      {
        conversationId: conv1.id,
        role: 'USER',
        content: '10:00 AM. My name is Ashwini Kumar, phone +1 (555) 432-1098.',
        intent: 'CUSTOMER_INFORMATION',
      },
      {
        conversationId: conv1.id,
        role: 'ASSISTANT',
        content: "You're all set, Ashwini! Your General Consultation is booked for today at 10:00 AM.",
        intent: 'BOOK_APPOINTMENT',
      },
    ],
  });

  // Escalated handoff conversation
  const conv2 = await prisma.conversation.create({
    data: {
      customerId: customer2.id,
      channel: 'VOICE',
      status: 'ESCALATED',
      primaryIntent: 'HUMAN_HANDOFF',
      confidence: 0.94,
      summary: 'Customer has urgent query regarding billing dispute and requested human receptionist.',
      priority: 'HIGH',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        role: 'USER',
        content: 'I need to speak to someone right away about an unexpected insurance charge.',
        intent: 'HUMAN_HANDOFF',
      },
      {
        conversationId: conv2.id,
        role: 'ASSISTANT',
        content: 'I understand. Let me connect you directly with a member of our front desk team. One of our human receptionists has been notified.',
        intent: 'HUMAN_HANDOFF',
      },
    ],
  });

  await prisma.humanHandoff.create({
    data: {
      conversationId: conv2.id,
      customerName: 'Elena Rostova',
      customerPhone: '+1 (555) 891-2345',
      customerEmail: 'elena.rostova@example.com',
      reason: 'Urgent billing dispute regarding insurance charge.',
      priority: 'HIGH',
      status: 'NEW',
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'New Appointment: Ashwini Kumar',
        message: 'General Consultation booked for today at 10:00 AM.',
        type: 'APPOINTMENT',
      },
      {
        title: 'Human Escalation Requested: Elena Rostova',
        message: 'Reason: Urgent billing dispute regarding insurance charge.',
        type: 'HANDOFF',
      },
    ],
  });

  console.log('✅ NovaCare Clinic database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
