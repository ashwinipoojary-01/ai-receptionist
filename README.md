# 🤖 AI Receptionist — Commercial 24/7 Virtual Front Desk Platform

An intelligent, commercial-grade full-stack AI Virtual Receptionist for clinics, salons, dental practices, hotels, real estate agencies, and service companies.

---

## 🌟 Key Highlights & Capabilities

* **24/7 Natural AI Front Desk:** Polite, professional conversational agent capable of understanding user intent and answering business questions accurately.
* **Deterministic Tool / Function Calling Engine:** Calls real backend functions (`checkAvailableSlots`, `bookAppointment`, `rescheduleAppointment`, `cancelAppointment`, `getBusinessInfo`, `getBusinessHours`, `getServices`, `searchFaq`, `createHumanHandoff`) instead of hallucinating availability or details.
* **Smart Double-Booking Prevention:** Computes duration-aware slot overlaps based on dynamic business hours and existing bookings.
* **Two-Way Voice Interaction:** Real-time microphone capture via Speech-to-Text with Speech Synthesis for hands-free caller interaction.
* **Human Handoff & Escalation Queue:** Intelligently detects caller frustration, sensitive billing disputes, or explicit handoff requests and alerts reception staff.
* **Full-Featured Admin Reception Portal:** Real-time schedule timeline, multi-turn conversation transcripts, customer directory, FAQ knowledge base editor, and business working hours configurator.
* **Zero-Dependency High-Fidelity Demo Engine:** Works out of the box with realistic simulated reasoning even without paid API keys, with simple toggle to live OpenAI/Gemini APIs.

---

## 🏗️ Architecture & Tech Stack

```text
ai-receptionist/
├── client/                     # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, MessageBubble, VoiceControls)
│   │   ├── hooks/              # Custom React hooks (useAuth, useVoice)
│   │   ├── layouts/            # Layout wrappers (AdminLayout)
│   │   ├── pages/              # LandingPage, ReceptionistPage, LoginPage, Admin pages
│   │   ├── services/           # Typed API Client (ApiService)
│   │   ├── types/              # Domain & DTO TypeScript interfaces
│   │   └── utils/              # Formatting helpers (cn, formatDate, formatTime)
│   ├── index.html
│   └── vite.config.ts
│
├── server/                     # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (User, Customer, Appointment, Faq, etc.)
│   │   └── seed.ts             # NovaCare Clinic demo seed data
│   ├── src/
│   │   ├── controllers/        # REST controllers (Auth, AI, Appointments, Business, FAQs)
│   │   ├── middleware/         # JWT Auth guard & centralized ErrorHandler
│   │   ├── routes/             # REST route endpoints with rate limiting
│   │   ├── services/           # Business logic & AI Engine (AIService, AITools, AppointmentService)
│   │   ├── test/               # Integration test suite (verify.ts)
│   │   ├── types/              # Domain type definitions
│   │   ├── app.ts              # Express application factory
│   │   └── index.ts            # Server entrypoint
│   └── tsconfig.json
│
├── package.json                # Monorepo workspace configuration
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js** v18+ (tested on Node v20/v24)
* **npm** v9+

### 2. Installation
Clone the repository and install all root and workspace dependencies:

```bash
npm install
```

### 3. Database Initialization & Seeding
Initialize the database and populate it with the default **NovaCare Clinic** demo scenario:

```bash
cd server
npm run db:push
npm run db:seed
cd ..
```

### 4. Running Locally
Start both backend (Port 5000) and frontend (Port 5173) in development mode:

```bash
npm run dev
```

* **Landing Page:** [http://localhost:5173](http://localhost:5173)
* **AI Receptionist Interface:** [http://localhost:5173/receptionist](http://localhost:5173/receptionist)
* **Admin Reception Portal:** [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin / Receptionist** | `admin@novacareclinic.com` | `admin123` |

---

## 🧪 Testing Backend Business Logic

Run the automated test verification suite covering Intent Detection, Double Booking Prevention, Availability Checking, and Escalation Triggers:

```bash
cd server
npm test
```

---

## 📡 Main REST API Endpoints

### Authentication
* `POST /api/auth/login` — Sign in and receive JWT token
* `POST /api/auth/register` — Register new admin user
* `GET /api/auth/me` — Inspect current session payload

### AI Virtual Receptionist
* `POST /api/ai/chat` — Multi-turn conversational endpoint with tool calling & intent detection
* `POST /api/ai/intent` — Standalone intent detector
* `POST /api/ai/summarize` — Generates clinical/business conversation summaries

### Appointments & Slots
* `GET /api/appointments/availability?date=YYYY-MM-DD&serviceId=ID` — Compute real free slots
* `POST /api/appointments` — Book confirmed appointment
* `GET /api/appointments` — List appointments (Admin protected)
* `PATCH /api/appointments/:id/reschedule` — Move appointment to new date/time
* `PATCH /api/appointments/:id/status` — Update appointment status (CONFIRMED / COMPLETED)
* `DELETE /api/appointments/:id` — Cancel appointment

### Knowledge Base & FAQs
* `GET /api/faqs` — List active FAQ entries
* `POST /api/faqs` — Add new clinic FAQ
* `PATCH /api/faqs/:id` — Edit FAQ entry
* `DELETE /api/faqs/:id` — Remove FAQ

### Business Configuration & Analytics
* `GET /api/business` — Retrieve clinic profile, hours, and services
* `PATCH /api/business` — Update clinic profile
* `PATCH /api/business/working-hours` — Configure open/closed hours per day
* `GET /api/analytics` — Executive dashboard statistics and intent metrics
