# Marketing Careers Seed

This directory contains seed data for the Career Fit Analysis application's marketing career database.

## Overview

**Total Careers:** 36 marketing positions covering the full career spectrum from intern to C-level

### Categories

1. **In-House Marketing (15 careers)** - Corporate/enterprise marketing roles
2. **Agency Marketing (13 careers)** - Marketing agency positions
3. **SME/Startup Marketing (5 careers)** - Small-medium business roles
4. **Specialized Marketing (3 careers)** - Channel/function specialists

---

## Career Progression Paths

### 📈 In-House Marketing Track

**Path 1: Digital Marketing**
```
Marketing Intern
  ↓
Digital Marketing Intern
  ↓
Digital Marketing Coordinator (1-3 years)
  ↓
Digital Marketing Manager (3-7 years)
  ↓
Senior Marketing Manager (7-12 years)
  ↓
Marketing Director (12-15 years)
  ↓
VP of Marketing (15-20 years)
  ↓
Chief Marketing Officer (20+ years)
```

**Path 2: Content/Brand**
```
Content Marketing Intern
  ↓
Content Marketing Specialist (1-3 years)
  ↓
Content Marketing Manager / Brand Manager (3-7 years)
  ↓
Senior Marketing Manager (7-12 years)
  ↓
Marketing Director (12-15 years)
  ↓
VP of Marketing / CMO (15-20+ years)
```

**Path 3: Analytics/Performance**
```
Marketing Intern
  ↓
Marketing Analyst (1-3 years)
  ↓
Performance Marketing Manager (3-7 years)
  ↓
Senior Marketing Manager (7-12 years)
  ↓
Marketing Director (12-15 years)
  ↓
VP of Marketing (15-20+ years)
```

**Path 4: Product/Social**
```
Digital Marketing Intern
  ↓
Digital Marketing Coordinator (1-3 years)
  ↓
Product Marketing Manager / Social Media Manager (3-7 years)
  ↓
Senior Marketing Manager (7-12 years)
  ↓
Marketing Director (12-15 years)
  ↓
VP of Marketing (15-20+ years)
```

---

### 🏢 Agency Marketing Track

**Path 1: Account Management**
```
Marketing Agency Intern
  ↓
Junior Account Executive (0-3 years)
  ↓
Account Manager (3-7 years)
  ↓
Senior Account Manager (7-10 years)
  ↓
Account Director (10-15 years)
```

**Path 2: Creative (Copywriting)**
```
Creative Intern
  ↓
(Junior) Copywriter (1-4 years)
  ↓
Senior Copywriter (4-8 years)
  ↓
Creative Director (8-15+ years)
```

**Path 3: Creative (Art Direction)**
```
Creative Intern
  ↓
(Junior) Art Director (1-4 years)
  ↓
Art Director (4-8 years)
  ↓
Creative Director (8-15+ years)
```

**Path 4: Strategy/Media**
```
Marketing Agency Intern
  ↓
Media Planner / Digital Strategist (1-5 years)
  ↓
Senior roles depending on specialization
```

---

### 🚀 SME/Startup Track

```
Marketing Generalist (SME) (0-3 years)
  ↓
Marketing Manager (SME) (3-6 years)
  ↓
Head of Marketing (SME) (6-10 years)
  ↓
VP of Marketing (Startup) (10+ years)

OR

Growth Hacker (0-4 years)
  ↓
Head of Growth / VP of Marketing (Startup) (4+ years)
```

---

### 🎯 Specialized Tracks

**These roles can exist at various levels in both In-House and Agency:**

- **SEO/SEM Specialist** → Senior SEO/SEM → Head of SEO/SEM
- **Community Manager** → Senior Community Manager → Head of Community
- **Influencer Marketing Manager** → Senior Influencer Marketing Manager → Head of Influencer Marketing

---

## Requirements Structure

Each career includes detailed requirements in 3 categories:

### A1: Personality & Behavioral Traits
- Openness (0-100)
- Conscientiousness (0-100)
- Extraversion (0-100)
- Agreeableness (0-100)
- Neuroticism/Emotional Stability (0-100)
- EQ/Emotional Intelligence (0-100)
- Adaptability (0-100)
- Stress Tolerance (0-100)
- Leadership (where applicable)

### A2: Skills & Talents
- Analytical Thinking (0-100)
- Creativity (0-100)
- Technical Aptitude (0-100)
- Communication (Written & Verbal) (0-100)
- Attention to Detail (0-100)
- Time Management (0-100)
- Digital Literacy (0-100)
- Learning Agility (0-100)
- Plus specialized skills per role

### A3: Values & Preferences
- Work-Life Balance (0-100)
- Creativity vs Structure (0-100) - Higher = more creative
- Autonomy vs Guidance (0-100) - Higher = more autonomy
- Impact vs Money (0-100) - Higher = values impact more
- Stability vs Growth (0-100) - Higher = values growth
- Collaboration vs Solo (0-100) - Higher = prefers collaboration
- Variety vs Routine (0-100) - Higher = prefers variety

---

## Salary Ranges (Vietnam Market)

### Intern Level
- VND 3,000,000 - 7,000,000/month

### Entry Level (1-3 years)
- VND 10,000,000 - 18,000,000/month

### Mid Level (3-7 years)
- VND 18,000,000 - 55,000,000/month

### Senior Level (7-12 years)
- VND 40,000,000 - 100,000,000/month

### Executive Level (12+ years)
- VND 100,000,000 - 300,000,000+/month

*Note: Agency roles may pay 10-20% less than equivalent in-house roles, but offer broader experience. Startup roles often include equity compensation.*

---

## Running the Seed

### Option 1: Direct Execution
```bash
cd backend
npx tsx prisma/seeds/marketing-careers.seed.ts
```

### Option 2: Via Package Script (if configured)
```bash
cd backend
npm run seed:marketing
```

### Expected Output
```
🌱 Starting marketing careers seed...
✨ Created: Marketing Intern
✨ Created: Digital Marketing Intern
... (36 total)

📊 Marketing Careers Seed Summary:
   ✨ Created: 36
   ✅ Updated: 0
   ❌ Skipped: 0
   📦 Total: 36

✅ Seed completed successfully!
```

---

## Career Fit Matching Algorithm

The matching algorithm uses weighted scoring across A1, A2, and A3 factors:

1. **A1 (Personality):** 30% weight
   - Compares user's Big Five, EQ, adaptability, stress tolerance
   - Critical traits (e.g., extraversion for client-facing roles) weighted higher

2. **A2 (Skills & Talents):** 40% weight
   - Compares analytical vs creative aptitude
   - Technical skills and learning agility
   - Communication abilities

3. **A3 (Values & Preferences):** 30% weight
   - Work-life balance expectations
   - Autonomy preferences
   - Collaboration vs solo work style
   - Career growth vs stability orientation

**Total Fit Score:** 0-100 per career

---

## Data Quality Notes

- All salary data reflects 2024-2025 Vietnam market rates
- Requirements based on industry standards and job market research
- Scores calibrated for Vietnamese job market context
- Work hours reflect typical expectations (may vary by company)

---

## Maintenance

To update careers:
1. Edit `marketing-careers.seed.ts`
2. Modify the career objects in the `marketingCareers` array
3. Run the seed script (upsert logic will update existing records)

To add new careers:
1. Add new career objects to the array
2. Follow the existing structure
3. Run the seed script

---

## Future Expansions

Potential additional career categories to add:
- **Finance & Accounting** (10-15 careers)
- **Technology & Engineering** (15-20 careers)
- **Sales & Business Development** (10-12 careers)
- **Human Resources** (8-10 careers)
- **Operations & Project Management** (10-12 careers)
- **Creative & Design** (8-10 careers)
- **Customer Success & Support** (6-8 careers)

Total potential: ~100-120 careers across all industries
