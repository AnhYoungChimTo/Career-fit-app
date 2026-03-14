# Career Fit Analysis Web Application

> **AI-powered career matching platform with dual-track interview system**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)

## 📋 Overview

Career Fit Analysis is a full-stack web application that helps users discover their ideal career path through intelligent assessments. It offers two interview paths:

- **Lite Version** (10-15 min): Quick career insights with immediate actionable roadmap
- **Deep Version** (3-4 hours): Comprehensive personality, talents, and values analysis

### Key Features

✅ Dual-track interview system (Lite & Deep)
✅ AI-powered career matching (hybrid algorithm + GPT-4)
✅ Smart recommendations based on user goals
✅ Seamless upgrade path (Lite → Deep)
✅ Auto-save with resume capability
✅ Mobile-first responsive design
✅ PDF report generation
✅ Confidence-based scoring

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router v6
- React Hook Form + Zod
- Recharts (visualizations)

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- OpenAI GPT-4 integration
- PDFKit (report generation)

**DevOps**
- Monorepo with npm workspaces
- Git + GitHub
- Frontend → **Vercel** (`https://career-fit-app-frontend.vercel.app`)
- Backend → **Render** (`https://career-fit-app-1.onrender.com`)
- Database → **Render PostgreSQL**

### Project Structure

```
career-fit-app/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   ├── public/
│   └── package.json
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── prisma/       # Database schema & migrations
│   │   ├── utils/        # Helper functions
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── questions/             # Interview question bank (JSON)
│   ├── lite/             # Lite version questions
│   └── deep/             # Deep version questions
│
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── SETUP.md          # Setup instructions
│   └── PRD.md            # Product requirements
│
├── package.json           # Root workspace config
├── .gitignore
└── README.md              # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+
- Git
- OpenAI API key (for GPT-4 integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/career-fit-app.git
cd career-fit-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001

DATABASE_URL=postgresql://user:password@localhost:5432/career_fit

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sk-your-openai-api-key

CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Career Fit Analysis
```

4. **Set up the database**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run seed
```

5. **Start development servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

6. **Open the application**
```
Frontend: http://localhost:5173
Backend API: http://localhost:3001
```

---

## 📚 Documentation

- [**Deployment & Feature Launch Guide**](./DEPLOYMENT_GUIDE.md) - ⭐ Start here for deploying or adding features
- [API Documentation](./docs/API.md) - Complete API reference
- [Setup Guide](./docs/SETUP.md) - Detailed setup instructions
- [Architecture](./docs/ARCHITECTURE.md) - System design and decisions
- [Product Requirements](./docs/PRD.md) - Full PRD document

---

## 🎯 Interview System

### Lite Version (10-15 minutes)

**Modules:**
- Skills & Talents Assessment
- Values & Preferences
- Current Situation & Dream Job

**Results:**
- Top 1-2 career matches
- Confidence: Medium
- 6-month roadmap (3-5 action items)
- Option to upgrade to Deep

### Deep Version (3-4 hours)

**Modules (12 total):**
A. Demographics
B. Family Background
C. Education
D. Work Experience
E. Knowledge Domains
F. Skills
G. Personality
H. Formative Experiences
I. Values
J. Network
K. Ikigai
L. Career Preferences

**Results:**
- Top 5 career matches
- Confidence: High
- Comprehensive A-score analysis
- Detailed development plans

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

---

## 🤝 Contributing

This is currently a private project. Contribution guidelines will be added when open-sourced.

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👤 Contact

**Project Owner:** [Your Name]
**Repository:** [github.com/minhanhvibecoding-labs/Career-fit-app](https://github.com/minhanhvibecoding-labs/Career-fit-app)

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Project setup, database schema, authentication

### Phase 2: Interview System ✅
- [x] Lite & Deep interview flows, auto-save, career matching, results dashboard, PDF reports

### Phase 3: Mentor Feature ✅ (launched 2026-03-13)
- [x] Mentor signup wizard, lobby, roadmap builder, chat, sessions, reviews, public profiles

### Phase 4: Future
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Vietnamese language support
- [ ] LinkedIn OAuth + Stripe payments (stubs exist)

---

**Built with ❤️ using React, Node.js, and AI**
