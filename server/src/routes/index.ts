import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { AppointmentController } from '../controllers/appointmentController.js';
import { CustomerController } from '../controllers/customerController.js';
import { ServiceController } from '../controllers/serviceController.js';
import { ConversationController } from '../controllers/conversationController.js';
import { BusinessController, FaqController } from '../controllers/businessController.js';
import { AIController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for AI chat endpoints
const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many requests, please try again later.' },
});

// --- AUTH ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', requireAuth, AuthController.me);

// --- AI CHAT & INTENT ---
router.post('/ai/chat', aiRateLimiter, AIController.chat);
router.post('/ai/intent', aiRateLimiter, AIController.detectIntent);
router.post('/ai/summarize', AIController.summarize);

// --- PUBLIC APPOINTMENT & AVAILABILITY ---
router.get('/appointments/availability', AppointmentController.getAvailability);
router.post('/appointments', AppointmentController.create);

// --- ADMIN PROTECTED APPOINTMENTS ---
router.get('/appointments', requireAuth, AppointmentController.list);
router.patch('/appointments/:id/reschedule', requireAuth, AppointmentController.reschedule);
router.patch('/appointments/:id/status', requireAuth, AppointmentController.updateStatus);
router.delete('/appointments/:id', requireAuth, AppointmentController.cancel);

// --- CUSTOMERS ---
router.get('/customers', requireAuth, CustomerController.list);
router.get('/customers/:id', requireAuth, CustomerController.getById);
router.post('/customers', requireAuth, CustomerController.create);
router.patch('/customers/:id', requireAuth, CustomerController.update);

// --- SERVICES (PUBLIC READ, ADMIN WRITE) ---
router.get('/services', ServiceController.list);
router.post('/services', requireAuth, ServiceController.create);
router.patch('/services/:id', requireAuth, ServiceController.update);
router.delete('/services/:id', requireAuth, ServiceController.delete);

// --- CONVERSATIONS & HANDOFFS ---
router.post('/conversations', ConversationController.create);
router.get('/conversations', requireAuth, ConversationController.list);
router.get('/conversations/:id', requireAuth, ConversationController.getById);
router.get('/handoffs', requireAuth, ConversationController.listHandoffs);
router.patch('/handoffs/:id', requireAuth, ConversationController.updateHandoff);

// --- BUSINESS & FAQS ---
router.get('/business', BusinessController.getProfile);
router.patch('/business', requireAuth, BusinessController.updateProfile);
router.patch('/business/working-hours', requireAuth, BusinessController.updateWorkingHours);
router.get('/analytics', requireAuth, BusinessController.getAnalytics);

router.get('/faqs', FaqController.list);
router.post('/faqs', requireAuth, FaqController.create);
router.patch('/faqs/:id', requireAuth, FaqController.update);
router.delete('/faqs/:id', requireAuth, FaqController.delete);

export default router;
