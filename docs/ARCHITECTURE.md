# System Architecture - Career Fit Analysis

## Overview

Career Fit Analysis is a full-stack web application built as a **monorepo** with separate frontend and backend services. The system implements a dual-track interview system (Lite and Deep versions) with AI-powered career matching.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           React SPA (Vite + TypeScript)             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │   │
│  │  │ Landing  │ │Interview │ │  Results Dashboard │  │   │
│  │  │   Page   │ │  System  │ │                    │  │   │
│  │  └──────────┘ └──────────┘ └────────────────────┘  │   │
│  │                                                       │   │
│  │  Tailwind CSS + shadcn/ui Components                │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / REST API
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                         API LAYER                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │      Node.js + Express + TypeScript Server          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │   │
│  │  │   Auth   │ │Interview │ │ Matching Service │   │   │
│  │  │Controller│ │Controller│ │                  │   │   │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │   │
│  │                                                       │   │
│  │  JWT Middleware | Validation | Error Handling       │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │  OpenAI GPT-4   │ │  File System    │
│    Database     │ │      API        │ │  (Questions)    │
│                 │ │                 │ │                 │
│ Prisma ORM      │ │ Career Insights │ │  JSON Files     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## Frontend Architecture

### Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast HMR, optimized builds)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing:** React Router v6
- **State Management:** React Context API + Hooks
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Charts:** Recharts

### Folder Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── auth/           # Login, Register, ProtectedRoute
│   ├── interview/      # QuestionCard, ProgressBar, Navigation
│   ├── results/        # Dashboard, CareerCard, ScoreBreakdown
│   ├── common/         # Header, Footer, Button, Input
│   └── ui/             # shadcn/ui components
│
├── pages/              # Page-level components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── InterviewSelection.tsx
│   ├── Interview.tsx
│   ├── Results.tsx
│   └── CareerDetails.tsx
│
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   └── InterviewContext.tsx
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useInterview.ts
│   └── useAutoSave.ts
│
├── services/           # API communication
│   ├── api.ts          # Axios instance with interceptors
│   ├── auth.service.ts
│   ├── interview.service.ts
│   └── results.service.ts
│
├── types/              # TypeScript type definitions
│   ├── user.types.ts
│   ├── interview.types.ts
│   ├── career.types.ts
│   └── question.types.ts
│
├── utils/              # Utility functions
│   ├── validation.ts
│   ├── formatters.ts
│   └── constants.ts
│
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Key Design Patterns

**1. Context + Hooks Pattern**
```typescript
// AuthContext provides authentication state globally
const { user, login, logout } = useAuth();

// InterviewContext manages interview state
const { currentQuestion, saveAnswer, goToNext } = useInterview();
```

**2. Protected Routes**
```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/interview" element={<Interview />} />
  <Route path="/results" element={<Results />} />
</Route>
```

**3. Auto-Save with Error Handling**
- Optimistic UI updates
- Background API calls with retry logic
- Block navigation if save fails (prevents data loss)

---

## Backend Architecture

### Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Express + TypeScript
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **AI Integration:** OpenAI GPT-4 API
- **PDF Generation:** PDFKit

### Folder Structure

```
backend/src/
├── controllers/        # Request handlers
│   ├── auth.controller.ts
│   ├── interview.controller.ts
│   ├── results.controller.ts
│   └── career.controller.ts
│
├── services/           # Business logic
│   ├── auth.service.ts
│   ├── interview.service.ts
│   ├── matching.service.ts    # Career matching algorithm
│   ├── gpt.service.ts         # OpenAI integration
│   └── pdf.service.ts         # PDF generation
│
├── middleware/         # Express middleware
│   ├── auth.middleware.ts     # JWT validation
│   ├── validation.middleware.ts
│   └── error.middleware.ts
│
├── routes/             # API route definitions
│   ├── auth.routes.ts
│   ├── interview.routes.ts
│   ├── results.routes.ts
│   └── career.routes.ts
│
├── prisma/             # Database
│   ├── schema.prisma   # Database schema
│   ├── migrations/     # Migration files
│   └── seed.ts         # Seed data (careers)
│
├── utils/              # Helper functions
│   ├── jwt.ts
│   ├── bcrypt.ts
│   └── validators.ts
│
├── types/              # TypeScript types
│   └── index.ts
│
├── config/             # Configuration
│   └── index.ts
│
└── server.ts           # Express app entry point
```

### Key Design Patterns

**1. Layered Architecture**
```
Routes → Controllers → Services → Database
```

**2. Dependency Injection**
```typescript
// Services are injected into controllers
class InterviewController {
  constructor(private interviewService: InterviewService) {}
}
```

**3. Middleware Chain**
```typescript
router.post('/interviews',
  authMiddleware,           // Verify JWT
  validateInterview,        // Validate request
  interviewController.create // Handle request
);
```

---

## Database Schema

### Core Tables

**User**
- `id` (UUID, PK)
- `email` (unique)
- `passwordHash`
- `name`
- `securityQuestion`
- `securityAnswerHash`
- `createdAt`, `updatedAt`

**Interview**
- `id` (UUID, PK)
- `userId` (FK → User)
- `interviewType` (enum: 'lite' | 'deep' | 'lite_upgraded') ⭐
- `status` (enum: 'in_progress' | 'completed' | 'abandoned')
- `currentModule`, `currentQuestion`
- `personalityData` (JSON)
- `talentsData` (JSON)
- `valuesData` (JSON)
- `sessionData` (JSON)
- `startedAt`, `completedAt`, `lastActivityAt`

**Result**
- `id` (UUID, PK)
- `interviewId` (FK → Interview)
- `aScore`, `a1Score`, `a2Score`, `a3Score`
- `careerMatches` (JSON array)
- `topCareer`, `topFitScore`
- `generatedAt`

**Career**
- `id` (UUID, PK)
- `name`, `vietnameseName`
- `description`
- `requirements` (JSON)
- `avgSalaryVND`, `workHoursPerWeek`
- `stressLevel`, `growthPotential`

### ER Diagram

```
┌─────────┐         ┌────────────┐         ┌────────┐
│  User   │────────<│ Interview  │>────────│ Result │
└─────────┘         └────────────┘         └────────┘
                            │
                            │ matches against
                            ▼
                    ┌────────────┐
                    │   Career   │
                    └────────────┘
```

---

## API Design

### RESTful Endpoints

**Authentication**
```
POST   /api/auth/register     # Create account
POST   /api/auth/login        # Login
POST   /api/auth/logout       # Logout
GET    /api/auth/me           # Get current user
POST   /api/auth/reset-password  # Reset via security question
```

**Interview**
```
POST   /api/interviews              # Start new interview
GET    /api/interviews/:id          # Get interview
PATCH  /api/interviews/:id          # Update interview
POST   /api/interviews/:id/answers  # Save answer
GET    /api/interviews/:id/progress # Get progress
POST   /api/interviews/:id/complete # Complete & analyze
POST   /api/interviews/:id/upgrade  # Upgrade Lite → Deep
```

**Results**
```
GET    /api/results/:interviewId     # Get results
GET    /api/results/:interviewId/pdf # Download PDF
```

**Careers**
```
GET    /api/careers        # List all careers
GET    /api/careers/:id    # Get career details
```

### Request/Response Format

**Standard Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  }
}
```

---

## Career Matching Algorithm

### A-Factor Scoring System

```
A = (A1 × 0.40) + (A2 × 0.35) + (A3 × 0.25)

Where:
  A1 = Personality Score (MBTI, Big Five, Work Style, EQ)
  A2 = Talents Score (Cognitive, Physical, Interpersonal, Learning)
  A3 = Values Score (Work-Life Balance, Impact, Stability, Ethics)
```

### Matching Process

1. **Data Collection** (Interview answers)
2. **Score Calculation** (Rule-based algorithm)
3. **Career Matching** (Compare against career requirements)
4. **Confidence Scoring** (Based on data completeness)
5. **AI Enhancement** (GPT-4 generates explanations & roadmaps)

### Lite vs Deep Differences

| Aspect | Lite (10-15 min) | Deep (3-4 hours) |
|--------|------------------|------------------|
| Data Points | ~40 questions | ~250 questions |
| A1 (Personality) | Basic traits | Full MBTI + Big Five |
| A2 (Talents) | Core skills | Comprehensive assessment |
| A3 (Values) | Key preferences | Deep values analysis |
| Confidence | Medium (60-80%) | High (85-95%) |
| Results | Top 1-2 careers | Top 5 careers |
| Roadmap | 6-month (3-5 items) | Detailed multi-year plan |

---

## Security Architecture

### Authentication Flow

```
1. User registers → Password hashed (bcrypt, 10 rounds)
2. User logs in → JWT token generated (7-day expiry)
3. Client stores JWT in memory (not localStorage - XSS protection)
4. Each API request → Authorization: Bearer <token>
5. Server validates JWT → Extracts user ID → Processes request
```

### Security Measures

- **Password Hashing:** bcrypt with 10 rounds
- **JWT Tokens:** Signed with secret, 7-day expiry
- **HTTPS Only:** Enforced in production
- **SQL Injection:** Protected via Prisma ORM
- **XSS:** React auto-escapes, Content-Security-Policy headers
- **CSRF:** SameSite cookies
- **Rate Limiting:** 5 requests/minute on auth endpoints
- **Input Validation:** Zod schemas on all inputs

---

## Data Flow Examples

### Interview Completion Flow

```
1. User answers question
   ↓
2. Frontend: Auto-save to local state
   ↓
3. Frontend → Backend: POST /api/interviews/:id/answers
   ↓
4. Backend: Validate & save to database
   ↓
5. Backend → Frontend: { success: true }
   ↓
6. Frontend: Allow navigation to next question
   ↓
7. (If save fails) Frontend: Block navigation, show error
```

### Upgrade Flow (Lite → Deep)

```
1. User completes Lite interview
   ↓
2. Frontend → Backend: POST /api/interviews/:id/complete
   ↓
3. Backend: Calculate A-scores, match careers (Lite data)
   ↓
4. Backend → Frontend: Lite results (top 1-2, medium confidence)
   ↓
5. User clicks "Upgrade to Deep"
   ↓
6. Frontend → Backend: POST /api/interviews/:id/upgrade
   ↓
7. Backend: Update interviewType = 'lite_upgraded'
   ↓
8. Backend → Frontend: List of missing modules
   ↓
9. User completes missing modules
   ↓
10. Backend: Recalculate with comprehensive data
   ↓
11. Frontend: Show Deep results (top 5, high confidence)
```

---

## Performance Considerations

### Frontend Optimizations
- **Code Splitting:** React.lazy() for routes
- **Memoization:** useMemo, useCallback for expensive operations
- **Virtualization:** Long lists (if needed)
- **Image Optimization:** WebP format, lazy loading

### Backend Optimizations
- **Database Indexing:** On userId, interviewId, email
- **Query Optimization:** Prisma select only needed fields
- **Caching:** Results cached for 24 hours
- **Pagination:** Career lists paginated (50 items/page)

### Target Metrics
- **Page Load:** <3 seconds (desktop), <5 seconds (mobile)
- **API Response:** <1 second (most endpoints)
- **Analysis:** <10 seconds (career matching)
- **Database Queries:** <200ms average

---

## Deployment Architecture (Future)

```
┌─────────────────┐
│  Vercel (CDN)   │  ← React SPA
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│  Railway        │  ← Node.js API
│  - Express App  │
│  - PostgreSQL   │
└─────────────────┘
```

---

## Key Architectural Decisions

### Why Monorepo?
- **Shared types** between frontend and backend
- **Coordinated releases**
- **Simplified development** (single git history)

### Why PostgreSQL?
- **Relational data** (users → interviews → results)
- **ACID compliance** (data integrity)
- **JSON support** (flexible interview data)

### Why Prisma ORM?
- **Type safety** (auto-generated TypeScript types)
- **Migration management**
- **SQL injection protection**

### Why JSON for Questions?
- **Easy to edit** (non-developers can modify)
- **Version controlled**
- **Fast loading** (no database queries)

### Why Hybrid AI Approach?
- **Consistent scoring** (rule-based ensures reproducibility)
- **Personalized insights** (GPT-4 adds human-like explanations)
- **Cost-effective** (GPT-4 only for final step, not every calculation)

---

## Trade-Offs & Limitations

### Current Limitations
1. **Single Language:** English only (v1)
2. **No Real-time Collaboration:** One user per interview
3. **Limited Admin Tools:** Manual database access for now
4. **GPT-4 Dependency:** Requires API key & internet

### Future Improvements
1. Multi-language support (i18n)
2. Real-time counselor chat
3. Admin dashboard for career management
4. Offline mode (PWA)
5. Mobile app (React Native)

---

## Tech Debt & Future Refactoring

### Known Tech Debt
- Security questions (should migrate to email-based reset)
- Monolithic matching service (consider microservices)
- No caching layer (add Redis for production)

### Planned Refactoring
- Extract common types to `shared/` package
- Implement comprehensive test coverage (>80%)
- Add API documentation (Swagger/OpenAPI)
- Set up CI/CD pipeline (GitHub Actions)

---

**This architecture supports the MVP and is designed to scale for future enhancements.**
