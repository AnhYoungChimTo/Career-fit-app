# API Caching System Design - Career Fit Analysis

## Problem Statement
Every time a user revisits their results page (or downloads PDF), the system calls GPT-4o API again — regenerating the same analysis. This wastes API tokens and slows down the experience.

---

## Solution: Two-Layer Caching Strategy

### Layer 1: Per-User Result Cache (Full Result Saved)
> **Purpose:** Same user reviewing their old result = ZERO API calls

```
┌─────────────────────────────────────────────────────────┐
│                    FIRST TIME FLOW                       │
│                                                          │
│  Person A completes test                                 │
│       │                                                  │
│       ▼                                                  │
│  System matches careers (fit score calculation)          │
│       │  ← No API call needed (pure math)               │
│       ▼                                                  │
│  GPT-4o generates personalized deep analysis             │
│       │  ← API CALL (costs tokens)                       │
│       ▼                                                  │
│  Show result cards to Person A                           │
│       │                                                  │
│       ▼                                                  │
│  ┌─────────────────────────────────────────────┐        │
│  │  SAVE to Result table (careerMatches JSON)   │        │
│  │  - Full GPT analysis (personalized)          │        │
│  │  - Fit scores, strengths, growth areas       │        │
│  │  - Career pattern, salary, roadmap           │        │
│  │  - Everything the user sees on screen        │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 REVIEW (LATER) FLOW                      │
│                                                          │
│  Person A clicks "Review Results" on Dashboard           │
│       │                                                  │
│       ▼                                                  │
│  Check Result table for this interviewId                 │
│       │                                                  │
│       ▼  ← FOUND! Return saved JSON immediately         │
│  Show exact same result cards                            │
│       │                                                  │
│       ▼                                                  │
│  ZERO API CALLS — instant load                           │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Per-Career Static Cache (Shared Across Users)
> **Purpose:** When User B matches the same career as User A, reuse career-specific info

```
┌─────────────────────────────────────────────────────────┐
│              CROSS-USER REUSE FLOW                       │
│                                                          │
│  Career: "Marketing Analyst" (Job Card)                  │
│  ┌──────────────────────────────────────────┐           │
│  │  Career.cachedAnalysis (SHARED)           │           │
│  │  ├── salaryInfo (entry/mid/senior VND)    │           │
│  │  ├── careerPattern                        │           │
│  │  │   ├── progression path                 │           │
│  │  │   ├── daily responsibilities           │           │
│  │  │   └── industry outlook (VN market)     │           │
│  │  ├── skillStack (10-15 skills)            │           │
│  │  └── learningPlan (6-month roadmap)       │           │
│  └──────────────────────────────────────────┘           │
│       │                                                  │
│       │  Person A was FIRST to match this career         │
│       │  → GPT generated ALL fields                      │
│       │  → Static parts saved to Career.cachedAnalysis   │
│       │                                                  │
│       │  Person B matches same career LATER               │
│       │  → Static parts loaded from cache (no API)       │
│       │  → GPT only generates PERSONALIZED analysis      │
│       │     (deep analysis, strengths, growth areas)     │
│       │  → Smaller prompt = fewer tokens                  │
│       │  → Person B's full result saved to Result table  │
└─────────────────────────────────────────────────────────┘
```

---

## What Gets Cached Where

### Result Table (Per-User, Per-Interview) — `Result.careerMatches`
Everything the user sees on screen:
| Field | Description | Personalized? |
|-------|-------------|---------------|
| `explanation` | 2-3 sentence fit summary | YES - unique per user |
| `detailedAnalysis` | 6-10 paragraph deep analysis | YES - unique per user |
| `strengths[]` | User's relevant strengths | YES - unique per user |
| `growthAreas[]` | Areas to develop | YES - unique per user |
| `roadmap` | Personalized transition plan | YES - unique per user |
| `careerPattern` | Progression, daily work, outlook | NO - same for all users |
| `salaryInfo` | Entry/mid/senior salary ranges | NO - same for all users |
| `skillStack[]` | Required skills list | NO - same for all users |
| `learningPlan` | 6-month month-by-month plan | NO - same for all users |
| `fitScore` | Match percentage | YES - calculated per user |
| `confidence` | low/medium/high | YES - based on data completeness |

### Career Table (Shared) — `Career.cachedAnalysis`
Only the career-specific (non-personalized) fields:
- `careerPattern` (progression, daily responsibilities, industry outlook)
- `salaryInfo` (entry/mid/senior level salary ranges in VND)
- `skillStack` (10-15 skills to acquire)
- `learningPlan` (generic 6-month plan template)

---

## API Call Decision Matrix

| Scenario | API Calls | What Happens |
|----------|-----------|-------------|
| Person A, first time, new career | **FULL** (1 call per match) | GPT generates everything. Save to Result + Career cache |
| Person A, first time, cached career | **PARTIAL** (1 smaller call per match) | GPT generates only personalized parts. Static from Career cache |
| Person A, reviewing old result | **ZERO** | Load from Result table |
| Person A, downloading PDF | **ZERO** | Load from Result table |
| Person B, same career as Person A | **PARTIAL** (1 smaller call per match) | Static from Career cache, GPT for personalized only |
| Person B, reviewing old result | **ZERO** | Load from Result table |

---

## Implementation Changes

### 1. `results.controller.ts` — Cache-First Logic
```
GET /api/results/:interviewId
  │
  ▼
  Check Result table for existing results
  │
  ├── FOUND → Return saved careerMatches JSON immediately
  │
  └── NOT FOUND → Call generateMatches()
                   │
                   ▼
                   Save full result to Result table
                   Return result to user
```

### 2. `matching.service.ts` — Save After Generation
- After `generateMatches()` completes, save the full result to the `Result` table
- Continue using `Career.cachedAnalysis` for static career data sharing
- When static cache exists, send a SMALLER prompt to GPT (skip static fields)

### 3. PDF Download — Use Cached Results
- `downloadPDF()` checks Result table first (same as getResults)
- No more duplicate API calls for PDF generation

---

## Tiered Model Strategy

```
┌──────────────────────────────────────────────────────────────────┐
│                    TWO-MODEL APPROACH                             │
│                                                                   │
│  PREMIUM MODEL (o1)                    FAST MODEL (gpt-4o-mini)  │
│  ┌────────────────────┐               ┌────────────────────────┐ │
│  │ Static Career Data  │               │ Personalized Analysis  │ │
│  │                     │               │                        │ │
│  │ • Career progression│               │ • Deep analysis (400w) │ │
│  │ • Daily work by lvl │               │ • Strengths list       │ │
│  │ • Industry outlook  │               │ • Growth areas         │ │
│  │   (VN/Asia/Global)  │               │ • Personal roadmap     │ │
│  │ • Salary ranges VND │               │ • Fit explanation      │ │
│  │ • 15-20 skill stack │               │                        │ │
│  │ • 6-month plan      │               │ Runs: once per user    │ │
│  │                     │               │ per career match       │ │
│  │ Runs: ONCE per      │               │ Then cached in Result  │ │
│  │ career (forever)    │               │ table forever          │ │
│  │ Shared by ALL users │               │                        │ │
│  └────────────────────┘               └────────────────────────┘ │
│                                                                   │
│  WHY: Premium model = better factual   WHY: Fast model = cheap   │
│  accuracy for salary, market data,     enough for per-user text  │
│  career paths. Worth the cost since    generation. Cached after  │
│  it's generated ONCE and reused by     first view anyway.        │
│  every user who matches that career.                              │
└──────────────────────────────────────────────────────────────────┘
```

### Environment Variables
```env
GPT_PREMIUM_MODEL=o1              # For career static data (default: o1)
GPT_FAST_MODEL=gpt-4o-mini        # For personalized analysis (default: gpt-4o-mini)
```

---

## Cost Estimate Per Interview

### Pricing Reference (as of 2025-2026)
| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| o1 | $15.00 | $60.00 |
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |

### Lite Interview (2 career matches)

**Scenario A: First user EVER to match these 2 careers (worst case)**
| Step | Model | Input tokens | Output tokens | Cost |
|------|-------|-------------|---------------|------|
| Static career 1 | o1 | ~1,500 | ~2,500 | ~$0.17 |
| Static career 2 | o1 | ~1,500 | ~2,500 | ~$0.17 |
| Personalized 1 | gpt-4o-mini | ~1,800 | ~1,500 | ~$0.001 |
| Personalized 2 | gpt-4o-mini | ~1,800 | ~1,500 | ~$0.001 |
| **Total** | | | | **~$0.34** |

**Scenario B: Career static already cached (most common)**
| Step | Model | Input tokens | Output tokens | Cost |
|------|-------|-------------|---------------|------|
| Personalized 1 | gpt-4o-mini | ~1,800 | ~1,500 | ~$0.001 |
| Personalized 2 | gpt-4o-mini | ~1,800 | ~1,500 | ~$0.001 |
| **Total** | | | | **~$0.002** |

**Scenario C: User reviewing old results**
| Step | Model | Cost |
|------|-------|------|
| Load from Result table | N/A | **$0.00** |

### Deep Interview (5 career matches)

**Scenario A: First user EVER (worst case)**
| Step | Cost |
|------|------|
| 5x o1 static | ~$0.85 |
| 5x gpt-4o-mini personalized | ~$0.005 |
| **Total** | **~$0.86** |

**Scenario B: Career static cached (common)**
| Step | Cost |
|------|------|
| 5x gpt-4o-mini personalized | **~$0.005** |

**Scenario C: Reviewing old results**
| Step | Cost |
|------|------|
| Load from DB | **$0.00** |

### Before vs After Comparison (per 100 interviews, assuming 50% career overlap)
| | Before (gpt-4o every time) | After (tiered + caching) |
|---|---|---|
| First view | $5-15 per 100 interviews | ~$4.30 first time (mostly o1 for new careers) |
| Repeat views | Same $5-15 AGAIN | **$0.00** |
| PDF downloads | Same $5-15 AGAIN | **$0.00** |
| **Total for 100 interviews + 100 reviews + 50 PDFs** | **~$25-45** | **~$4.55** |

---

## Database Changes Required
**None** — The `Result` model already exists with the `careerMatches Json` field. We just need to actually USE it.

The tiered model can be configured via environment variables (`GPT_PREMIUM_MODEL`, `GPT_FAST_MODEL`) without any code changes.
