# Career Database Seeding Guide

**Purpose**: This guide provides a standardized workflow for researching, structuring, and seeding career data for new industries and fields into the Career Fit application database.

**Last Updated**: February 16, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Career Selection Criteria](#career-selection-criteria)
3. [Research Methodology](#research-methodology)
4. [Career Data Structure](#career-data-structure)
5. [A-Factor Scoring System](#a-factor-scoring-system)
6. [Vietnam Market Salary Research](#vietnam-market-salary-research)
7. [File Structure & Naming](#file-structure--naming)
8. [Implementation Workflow](#implementation-workflow)
9. [Testing & Validation](#testing--validation)
10. [Examples by Industry](#examples-by-industry)

---

## Overview

### What is Career Seeding?

Career seeding is the process of researching, structuring, and adding comprehensive career profiles to the application's database. Each career profile includes:

- Role descriptions (English + Vietnamese)
- A1/A2/A3 requirements (personality, skills, values)
- Vietnam market salary data
- Work conditions (hours, stress level, growth potential)
- Career progression paths

### Why This Matters

The quality of career recommendations depends entirely on:
1. **Breadth**: Covering diverse industries beyond tech (NGO, finance, creative, government, etc.)
2. **Depth**: Complete progression paths from entry-level to executive
3. **Accuracy**: Realistic requirements and salary data for Vietnam market
4. **Relevance**: Careers that match undergraduate students' aspirations

---

## Career Selection Criteria

### Which Careers to Include

✅ **DO Include**:
- Careers accessible to Vietnamese undergraduate students
- Clear entry points (internships, junior roles)
- Complete progression paths (5-7 levels from intern to executive)
- Realistic local opportunities in Vietnam or internationally
- Diverse industries to avoid bias

❌ **DON'T Include**:
- Careers requiring advanced degrees by default (unless common path)
- Highly niche roles with <100 openings nationally
- Careers with unclear progression paths
- Roles inaccessible to new graduates

### Industry Coverage Strategy

**Current Coverage** (as of Feb 2026):
- ✅ Marketing & Digital Marketing (43 careers)
- ✅ International Relations & NGO (42 careers)

**Priority Industries to Add**:
1. **Finance & Banking** (Investment banking, corporate finance, fintech, accounting)
2. **Creative Industries** (Graphic design, content creation, UX/UI, advertising, media)
3. **Education & Training** (Teaching, EdTech, corporate training, curriculum design)
4. **Healthcare & Public Health** (Hospital admin, health policy, medical research, pharma)
5. **Technology & Engineering** (Software dev, data science, product management, engineering)
6. **Government & Public Sector** (Civil service, policy analysis, urban planning)
7. **Hospitality & Tourism** (Hotel management, tourism, event planning)
8. **Entrepreneurship & Startups** (Founder paths, business development, venture capital)

**Target**: 300-500 total careers across 10-15 industries

---

## Research Methodology

### Step 1: Industry Research (2-4 hours per industry)

**Sources**:
1. **Vietnam Job Boards**:
   - VietnamWorks (vietnamworks.com) - Browse by industry, filter by experience level
   - CareerBuilder Vietnam - Check salary surveys
   - LinkedIn Vietnam - Analyze job postings and career paths
   - TopCV Vietnam - Entry-level focus

2. **International References**:
   - O*NET Online (onetonline.org) - US labor statistics
   - LinkedIn Career Explorer - Global career paths
   - Glassdoor - Salary data and role descriptions
   - Bureau of Labor Statistics - Industry outlooks

3. **Industry-Specific Resources**:
   - Professional associations (e.g., CIFV for finance, VCCI for business)
   - University career centers (VNU, RMIT, etc.)
   - Industry reports and whitepapers

**What to Gather**:
- [ ] Common job titles at each seniority level
- [ ] Typical responsibilities and daily tasks
- [ ] Required skills and personality traits
- [ ] Salary ranges (VND) for Vietnam market
- [ ] Career progression timeline (years between levels)
- [ ] Industry-specific terminology

### Step 2: Define Career Ladder (1-2 hours per sector)

Create a progression path with 5-7 levels:

**Standard Progression Model**:
1. **Intern** (0-6 months experience) - Learning, assisting, observing
2. **Entry-Level** (0-2 years) - Executing tasks, building foundations
3. **Mid-Level** (2-5 years) - Independent work, managing projects
4. **Senior** (5-8 years) - Leading projects, mentoring juniors
5. **Lead/Manager** (8-12 years) - Managing teams, strategic input
6. **Director** (12-15 years) - Department leadership, policy setting
7. **Executive** (15+ years) - Organization-wide leadership, vision setting

**Example - Finance Sector**:
- Finance Intern → Junior Analyst → Financial Analyst → Senior Analyst → Finance Manager → Finance Director → CFO

**Example - Creative Sector**:
- Design Intern → Junior Designer → Designer → Senior Designer → Design Lead → Creative Director → Chief Creative Officer

### Step 3: Map A-Factor Requirements (30-45 min per career)

For each career, determine personality, skills, and values requirements.

#### A1: Personality Traits (Big Five + EQ)

**Reference Scale**:
- 0-20: Very low requirement
- 21-40: Low requirement
- 41-60: Moderate requirement
- 61-80: High requirement
- 81-100: Very high requirement

**Example Mapping**:

| Trait | Accountant | Event Planner | Research Scientist |
|-------|-----------|---------------|-------------------|
| Openness | 50 | 85 | 95 |
| Conscientiousness | 95 | 90 | 90 |
| Extraversion | 40 | 85 | 30 |
| Agreeableness | 60 | 80 | 50 |
| Neuroticism | 30 | 25 | 35 |
| EQ | 60 | 85 | 55 |
| Adaptability | 55 | 90 | 70 |
| Stress Tolerance | 70 | 85 | 75 |

**Questions to Ask**:
- Does this role require creativity and new ideas? → **Openness**
- How important is precision and organization? → **Conscientiousness**
- How much social interaction is required? → **Extraversion**
- Does this role require empathy and cooperation? → **Agreeableness**
- How emotionally stable must someone be? → **Neuroticism** (lower = more stable)
- How important is reading emotions and social dynamics? → **EQ**
- How often do priorities and situations change? → **Adaptability**
- How high-pressure is this role? → **Stress Tolerance**

#### A2: Skills & Competencies

**Core Skills (0-100 scale)**:
- `analytical_thinking`: Logic, problem-solving, critical thinking
- `creativity`: Innovation, originality, creative problem-solving
- `technical_aptitude`: Learning technical tools/systems
- `communication_written`: Writing reports, emails, documents
- `communication_verbal`: Speaking, presenting, explaining
- `attention_to_detail`: Noticing errors, precision work
- `time_management`: Meeting deadlines, prioritization
- `digital_literacy`: Using software, online tools
- `learning_agility`: Learning new skills quickly

**Industry-Specific Skills** (add as needed):
- Finance: `quantitative_analysis`, `financial_modeling`, `risk_assessment`
- Creative: `visual_design`, `storytelling`, `aesthetic_judgment`
- NGO/IR: `cross_cultural_competence`, `language_skills`, `diplomacy`
- Healthcare: `scientific_knowledge`, `patient_care`, `medical_ethics`
- Education: `teaching_ability`, `curriculum_design`, `student_engagement`

**Example - Graphic Designer (Mid-Level)**:
```typescript
a2: {
  analytical_thinking: 60,
  creativity: 95,
  technical_aptitude: 85,
  communication_written: 60,
  communication_verbal: 70,
  attention_to_detail: 90,
  time_management: 75,
  digital_literacy: 90,
  learning_agility: 80,
  visual_design: 95,
  aesthetic_judgment: 90,
  storytelling: 75
}
```

#### A3: Values & Work Preferences

**Core Values (0-100 scale)**:
- `work_life_balance`: How important is personal time? (0=willing to sacrifice, 100=essential)
- `creativity_vs_structure`: Preference for creative freedom vs. clear processes (0=structure, 100=creativity)
- `autonomy_vs_guidance`: Preference for independence vs. mentorship (0=guidance, 100=autonomy)
- `impact_vs_money`: Motivation by social impact vs. financial rewards (0=money, 100=impact)
- `stability_vs_growth`: Preference for security vs. rapid advancement (0=growth, 100=stability)
- `collaboration_vs_solo`: Preference for teamwork vs. independent work (0=solo, 100=collaboration)
- `variety_vs_routine`: Preference for diverse tasks vs. consistent work (0=routine, 100=variety)

**Example - Investment Banker (Entry-Level)**:
```typescript
a3: {
  work_life_balance: 20,        // Very low - long hours expected
  creativity_vs_structure: 40,   // Moderate structure
  autonomy_vs_guidance: 30,      // Prefer guidance at entry level
  impact_vs_money: 25,           // Money-motivated
  stability_vs_growth: 40,       // Growth-focused
  collaboration_vs_solo: 70,     // Team-oriented
  variety_vs_routine: 60         // Moderate variety
}
```

**Example - Social Worker (Mid-Level)**:
```typescript
a3: {
  work_life_balance: 65,         // Important but manageable
  creativity_vs_structure: 60,   // Some creativity needed
  autonomy_vs_guidance: 50,      // Balanced
  impact_vs_money: 90,           // Impact-driven
  stability_vs_growth: 60,       // Moderate stability
  collaboration_vs_solo: 80,     // Highly collaborative
  variety_vs_routine: 75         // Varied cases and situations
}
```

---

## Vietnam Market Salary Research

### Sources for Vietnam Salary Data

**Primary Sources**:
1. **VietnamWorks Salary Survey** (annual report)
2. **Mercer Vietnam Compensation Report**
3. **Adecco Vietnam Salary Guide**
4. **LinkedIn Salary Insights** (Vietnam filter)
5. **Job postings** on VietnamWorks, CareerBuilder, TopCV

**Secondary Sources**:
- Glassdoor Vietnam
- PayScale (limited Vietnam data)
- Company career pages (VinGroup, FPT, Viettel, etc.)
- Recruitment agency reports (Navigos, Anphabe, etc.)

### Salary Ranges by Experience Level (2026 Reference)

**General Guidelines** (across industries):

| Level | Years Experience | Monthly Salary (VND) | Annual Salary (VND) |
|-------|-----------------|---------------------|---------------------|
| **Intern** | 0-6 months | 2M - 7M | 24M - 84M |
| **Entry** | 0-2 years | 8M - 15M | 96M - 180M |
| **Mid** | 2-5 years | 15M - 30M | 180M - 360M |
| **Senior** | 5-8 years | 30M - 60M | 360M - 720M |
| **Lead/Manager** | 8-12 years | 50M - 100M | 600M - 1.2B |
| **Director** | 12-15 years | 80M - 150M | 960M - 1.8B |
| **Executive** | 15+ years | 120M - 300M+ | 1.44B - 3.6B+ |

**Industry Multipliers**:
- **Finance/Banking**: 1.3-1.5x (higher than average)
- **Technology**: 1.2-1.4x
- **International NGO**: 1.1-1.3x (for international orgs)
- **Local NGO**: 0.7-0.9x (lower than average)
- **Education**: 0.8-1.0x
- **Government**: 0.6-0.8x (fixed salary scales)
- **Startups**: 0.9-1.1x (with equity potential)
- **Creative/Agency**: 0.9-1.2x

### How to Format Salary Data

**Format**: `"{min} - {max}"` in VND

**Examples**:
```typescript
// Intern
avgSalaryVND: "2,000,000 - 5,000,000"  // 2M - 5M VND/month

// Entry-Level Marketing Coordinator
avgSalaryVND: "10,000,000 - 18,000,000"  // 10M - 18M VND/month

// Senior Financial Analyst
avgSalaryVND: "35,000,000 - 65,000,000"  // 35M - 65M VND/month

// Finance Director
avgSalaryVND: "100,000,000 - 180,000,000"  // 100M - 180M VND/month
```

**Special Cases**:
- Government roles: Use official salary scales from Decree 204/2004/NĐ-CP (updated versions)
- Freelance/Contract: Show hourly or project rates
- Equity-heavy startups: Note in description, use cash salary only

---

## Career Data Structure

### Complete TypeScript Schema

```typescript
interface Career {
  name: string;                    // English job title
  vietnameseName: string;          // Vietnamese translation
  description: string;             // 2-4 sentence role description
  requirements: {
    a1: {
      openness: number;              // 0-100
      conscientiousness: number;     // 0-100
      extraversion: number;          // 0-100
      agreeableness: number;         // 0-100
      neuroticism: number;           // 0-100 (lower = more stable)
      eq_emotional_intelligence: number;  // 0-100
      adaptability: number;          // 0-100
      stress_tolerance: number;      // 0-100
    };
    a2: {
      analytical_thinking: number;   // 0-100
      creativity: number;            // 0-100
      technical_aptitude: number;    // 0-100
      communication_written: number; // 0-100
      communication_verbal: number;  // 0-100
      attention_to_detail: number;   // 0-100
      time_management: number;       // 0-100
      digital_literacy: number;      // 0-100
      learning_agility: number;      // 0-100
      // Industry-specific skills (optional):
      [key: string]: number;         // e.g., visual_design, financial_modeling
    };
    a3: {
      work_life_balance: number;     // 0-100
      creativity_vs_structure: number;  // 0-100
      autonomy_vs_guidance: number;  // 0-100
      impact_vs_money: number;       // 0-100
      stability_vs_growth: number;   // 0-100
      collaboration_vs_solo: number; // 0-100
      variety_vs_routine: number;    // 0-100
    };
  };
  avgSalaryVND: string;              // "min - max" format
  workHoursPerWeek: number;          // Typical hours (35-60)
  stressLevel: 'low' | 'medium' | 'high' | 'very_high';
  growthPotential: 'low' | 'medium' | 'high' | 'very_high';
}
```

### Field Guidelines

#### `name` (English Job Title)
- Use standard industry terminology
- Be specific but not overly technical
- Format: Title Case
- Examples: "Financial Analyst", "UX Designer", "Program Manager"

#### `vietnameseName` (Vietnamese Translation)
- Translate job title to Vietnamese
- Use professional/formal language
- Consult Vietnamese job boards for standard translations
- Examples: "Nhân viên Phân tích Tài chính", "Thiết kế Trải nghiệm Người dùng"

**Common Translations**:
- Intern → Thực tập sinh
- Manager → Quản lý
- Director → Giám đốc
- Analyst → Nhân viên Phân tích
- Coordinator → Điều phối viên
- Specialist → Chuyên viên
- Senior → Cao cấp
- Chief → Tổng giám đốc

#### `description`
- 2-4 sentences describing the role
- Focus on: main responsibilities, typical work, who they work with
- Write for undergraduate students (avoid jargon)
- Mention growth opportunities for entry-level roles

**Template**:
```
"[Role title] [main responsibility] in [context/industry]. This role involves [key tasks 1-3],
working closely with [teams/stakeholders]. [Entry-level: Growth opportunity sentence.
Senior: Strategic impact sentence.]"
```

**Examples**:

```typescript
// Entry-Level
description: "Junior Financial Analysts support financial planning and analysis for
businesses or investment firms. This role involves data collection, financial modeling,
and report preparation, working closely with senior analysts and finance teams.
Excellent foundation for careers in corporate finance or investment banking."

// Mid-Level
description: "UX Designers create user-centered digital experiences for websites,
apps, and software products. This role involves user research, wireframing, prototyping,
and usability testing, collaborating with product managers, developers, and stakeholders.
Strong demand across tech companies, agencies, and enterprises."

// Senior
description: "Senior Policy Analysts lead research and analysis on public policy issues,
providing strategic recommendations to government agencies, NGOs, or think tanks. This
role involves designing research methodologies, analyzing complex data, and presenting
findings to decision-makers. Significant influence on policy development and social impact."
```

#### `workHoursPerWeek`
- Typical expected hours (not maximum)
- Consider overtime culture in Vietnam
- Standard ranges:
  - 35-40: Work-life balanced roles (education, government)
  - 40-45: Standard professional roles (most careers)
  - 45-50: Demanding roles (finance, consulting, startups)
  - 50-60: High-intensity roles (investment banking, executive)
  - 60+: Exceptional cases (startup founders, crisis management)

#### `stressLevel`
- `'low'`: Predictable work, manageable deadlines, low stakes
- `'medium'`: Moderate pressure, regular deadlines, some challenges
- `'high'`: High pressure, tight deadlines, significant responsibility
- `'very_high'`: Extreme pressure, constant urgency, critical decisions

**Examples by Role**:
- Low: Librarian, Research Assistant, Data Entry
- Medium: Marketing Coordinator, Junior Designer, HR Specialist
- High: Project Manager, Senior Consultant, ER Doctor
- Very High: Investment Banker, Trauma Surgeon, Startup CEO

#### `growthPotential`
- `'low'`: Limited advancement (specialized/niche roles)
- `'medium'`: Steady progression (government, education)
- `'high'`: Strong growth opportunities (most corporate careers)
- `'very_high'`: Rapid advancement possible (tech, finance, startups)

---

## File Structure & Naming

### Directory Organization

```
career-fit-app/
└── backend/
    └── prisma/
        └── seeds/
            ├── marketing-careers.seed.ts           ✅ Exists (43 careers)
            ├── international-relations-careers.seed.ts  ✅ Exists (42 careers)
            ├── finance-careers.seed.ts             📝 To create
            ├── creative-careers.seed.ts            📝 To create
            ├── education-careers.seed.ts           📝 To create
            ├── healthcare-careers.seed.ts          📝 To create
            ├── technology-careers.seed.ts          📝 To create
            └── government-careers.seed.ts          📝 To create
```

### File Naming Convention

**Pattern**: `{industry-sector}-careers.seed.ts`

**Rules**:
- Use lowercase with hyphens (kebab-case)
- Keep names concise but descriptive
- Use plural "careers"
- End with `.seed.ts`

**Good Examples**:
- ✅ `finance-careers.seed.ts`
- ✅ `creative-industries-careers.seed.ts`
- ✅ `public-health-careers.seed.ts`

**Bad Examples**:
- ❌ `Finance.seed.ts` (not descriptive)
- ❌ `finance_careers_seed.ts` (use hyphens, not underscores)
- ❌ `financeAndBanking.seed.ts` (use hyphens, not camelCase)

---

## Implementation Workflow

### Step-by-Step Process

#### Phase 1: Research & Planning (3-5 hours)

1. **Choose Industry Sector**
   - Select from priority list or user request
   - Verify sufficient job market data exists for Vietnam
   - Confirm undergraduate accessibility

2. **Research Career Paths**
   - Identify 5-7 progression levels
   - List 6-10 careers per sector minimum
   - Gather salary data from Vietnamese sources
   - Document industry-specific skills needed

3. **Create Industry Summary Document** (optional but recommended)
   - Example: `FINANCE_CAREERS_SUMMARY.md`
   - List all careers with brief descriptions
   - Document salary research sources
   - Note industry-specific considerations

#### Phase 2: File Creation (2-4 hours)

**Template Structure**:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const {industryName}Careers = [
  {
    name: 'Role Title',
    vietnameseName: 'Tên Tiếng Việt',
    description: 'Role description here...',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 80,
        extraversion: 60,
        agreeableness: 70,
        neuroticism: 35,
        eq_emotional_intelligence: 75,
        adaptability: 75,
        stress_tolerance: 70
      },
      a2: {
        analytical_thinking: 80,
        creativity: 60,
        technical_aptitude: 70,
        communication_written: 75,
        communication_verbal: 65,
        attention_to_detail: 85,
        time_management: 75,
        digital_literacy: 80,
        learning_agility: 80,
        // Industry-specific skills:
        quantitative_analysis: 85,
        financial_modeling: 75
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 35,
        impact_vs_money: 30,
        stability_vs_growth: 50,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55
      }
    },
    avgSalaryVND: '10,000,000 - 18,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'high'
  },
  // ... more careers
];

export async function seed{IndustryName}Careers() {
  console.log('📊 Seeding {Industry Name} Careers...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const careerData of {industryName}Careers) {
    const result = await prisma.career.upsert({
      where: { name: careerData.name },
      update: {
        vietnameseName: careerData.vietnameseName,
        description: careerData.description,
        requirements: careerData.requirements,
        avgSalaryVND: careerData.avgSalaryVND,
        workHoursPerWeek: careerData.workHoursPerWeek,
        stressLevel: careerData.stressLevel,
        growthPotential: careerData.growthPotential
      },
      create: careerData
    });

    // Count created vs updated
    const existingCareer = await prisma.career.findUnique({
      where: { name: careerData.name }
    });

    if (existingCareer && existingCareer.createdAt < result.updatedAt) {
      updatedCount++;
    } else {
      createdCount++;
    }
  }

  console.log(`   ✅ Created: ${createdCount} careers`);
  console.log(`   🔄 Updated: ${updatedCount} careers`);
  console.log(`   📦 Total: ${createdCount + updatedCount} careers processed`);

  return { createdCount, updatedCount };
}

// Allow running this seed file independently
if (require.main === module) {
  seed{IndustryName}Careers()
    .catch((e) => {
      console.error('❌ Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
```

#### Phase 3: Integration (15-30 minutes)

1. **Update Main Seed File** (`backend/src/prisma/seed.ts`):

```typescript
import { PrismaClient } from '@prisma/client';
import { seedMarketingCareers } from '../../prisma/seeds/marketing-careers.seed';
import { seedInternationalRelationsCareers } from '../../prisma/seeds/international-relations-careers.seed';
import { seedFinanceCareers } from '../../prisma/seeds/finance-careers.seed';  // NEW

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed marketing careers
  console.log('📊 Seeding Marketing Careers...');
  await seedMarketingCareers();
  console.log('');

  // Seed international relations careers
  console.log('🌍 Seeding International Relations Careers...');
  await seedInternationalRelationsCareers();
  console.log('');

  // Seed finance careers  // NEW
  console.log('💰 Seeding Finance Careers...');
  await seedFinanceCareers();
  console.log('');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

2. **Add Individual Seed Script** (`backend/package.json`):

```json
{
  "scripts": {
    "seed": "tsx src/prisma/seed.ts",
    "seed:marketing": "tsx prisma/seeds/marketing-careers.seed.ts",
    "seed:international-relations": "tsx prisma/seeds/international-relations-careers.seed.ts",
    "seed:finance": "tsx prisma/seeds/finance-careers.seed.ts"  // NEW
  }
}
```

#### Phase 4: Testing (15-30 minutes)

1. **Run Individual Seed**:
```bash
cd backend
npm run seed:finance
```

Expected output:
```
📊 Seeding Finance Careers...
   ✅ Created: 35 careers
   🔄 Updated: 0 careers
   📦 Total: 35 careers processed
```

2. **Run Full Seed**:
```bash
npm run seed
```

3. **Verify in Database**:
```bash
npm run prisma:studio
```
- Open Prisma Studio
- Navigate to Career model
- Filter by industry/sector
- Verify data accuracy

4. **Test Career Matching** (once frontend is ready):
- Complete a test interview
- Verify new careers appear in recommendations
- Check salary ranges display correctly
- Confirm Vietnamese translations render properly

---

## Testing & Validation

### Data Quality Checklist

Before committing new career seeds, verify:

**Completeness**:
- [ ] All required fields present (no nulls)
- [ ] Vietnamese translations for all careers
- [ ] Salary ranges formatted correctly
- [ ] All A1/A2/A3 values between 0-100
- [ ] Industry-specific skills documented

**Accuracy**:
- [ ] Salary data matches current Vietnam market (2026)
- [ ] Job titles match industry standards
- [ ] Career progression paths logical
- [ ] Requirements realistic for each level
- [ ] Work hours reflect actual expectations

**Consistency**:
- [ ] Similar roles have similar requirements
- [ ] Progression shows increasing requirements
- [ ] Naming convention follows pattern
- [ ] Salary increases align with experience
- [ ] Stress levels match job intensity

**Diversity**:
- [ ] Covers entry to executive levels
- [ ] Includes various specializations
- [ ] Different work environments represented
- [ ] Range of skill requirements (analytical, creative, social)

### Manual Testing Steps

1. **Upsert Logic Test**:
```bash
# Run seed twice - second run should update, not create duplicates
npm run seed:finance
npm run seed:finance
# Should show: Created: 0, Updated: 35
```

2. **Individual vs. Full Seed Test**:
```bash
# Clear database
npx prisma migrate reset --force

# Run individual seed
npm run seed:finance
# Note count

# Run full seed
npm run seed
# Verify no duplicates, same count for finance sector
```

3. **Query Test**:
```typescript
// In Prisma Studio or console
const financeCareers = await prisma.career.findMany({
  where: {
    name: {
      contains: 'Financial' // or other industry keyword
    }
  }
});
console.log(`Found ${financeCareers.length} finance careers`);
```

---

## Examples by Industry

### Example 1: Finance Sector

**Careers to Include** (35-40 careers):

**Banking Track**:
1. Banking Intern
2. Teller / Customer Service Representative
3. Personal Banker
4. Relationship Manager
5. Branch Manager
6. Regional Banking Manager
7. Head of Retail Banking

**Corporate Finance Track**:
8. Finance Intern
9. Junior Financial Analyst
10. Financial Analyst
11. Senior Financial Analyst
12. Finance Manager
13. Finance Director
14. Chief Financial Officer (CFO)

**Investment Banking Track**:
15. Investment Banking Intern
16. Investment Banking Analyst
17. Investment Banking Associate
18. Vice President (Investment Banking)
19. Director (Investment Banking)
20. Managing Director (Investment Banking)

**Accounting Track**:
21. Accounting Intern
22. Junior Accountant
23. Accountant
24. Senior Accountant
25. Accounting Manager
26. Financial Controller
27. Chief Accounting Officer

**FinTech Track**:
28. FinTech Analyst Intern
29. Junior FinTech Analyst
30. FinTech Product Manager
31. Senior FinTech Strategist
32. Head of FinTech Innovation

**Industry-Specific A2 Skills**:
```typescript
a2: {
  // ... standard skills
  quantitative_analysis: 85,      // Strong for all finance roles
  financial_modeling: 80,         // Excel, forecasting
  risk_assessment: 75,            // Understanding financial risk
  regulatory_knowledge: 70,       // Banking laws, compliance
  business_acumen: 75             // Understanding markets
}
```

### Example 2: Creative Industries Sector

**Careers to Include** (40-45 careers):

**Graphic Design Track**:
1. Design Intern
2. Junior Graphic Designer
3. Graphic Designer
4. Senior Graphic Designer
5. Lead Designer
6. Art Director
7. Creative Director

**UX/UI Design Track**:
8. UX Design Intern
9. Junior UX/UI Designer
10. UX/UI Designer
11. Senior UX Designer
12. Lead Product Designer
13. Head of Design
14. Chief Design Officer

**Content Creation Track**:
15. Content Intern
16. Junior Content Creator
17. Content Creator / Writer
18. Senior Content Strategist
19. Content Director
20. Head of Content

**Video Production Track**:
21. Video Production Intern
22. Junior Video Editor
23. Video Producer
24. Senior Video Director
25. Head of Video Production

**Advertising Track**:
26. Advertising Intern
27. Junior Copywriter
28. Copywriter
29. Senior Copywriter
30. Creative Director (Advertising)
31. Executive Creative Director

**Industry-Specific A2 Skills**:
```typescript
a2: {
  // ... standard skills
  visual_design: 90,              // Aesthetic judgment, composition
  storytelling: 85,               // Narrative creation
  creative_problem_solving: 90,  // Innovative solutions
  aesthetic_judgment: 85,         // Understanding beauty/design
  brand_thinking: 75              // Brand strategy understanding
}
```

### Example 3: Education Sector

**Careers to Include** (30-35 careers):

**Teaching Track**:
1. Teaching Assistant
2. Junior Teacher
3. Teacher (Primary/Secondary)
4. Senior Teacher
5. Department Head
6. Vice Principal
7. Principal

**Higher Education Track**:
8. Graduate Teaching Assistant
9. Lecturer
10. Senior Lecturer
11. Associate Professor
12. Professor
13. Dean
14. University President

**EdTech Track**:
15. EdTech Intern
16. Learning Designer
17. Senior Instructional Designer
18. Head of Learning Experience
19. Chief Learning Officer

**Corporate Training Track**:
20. Training Coordinator
21. Corporate Trainer
22. Senior Training Consultant
23. Learning & Development Manager
24. Head of Talent Development

**Industry-Specific A2 Skills**:
```typescript
a2: {
  // ... standard skills
  teaching_ability: 90,           // Explaining, engaging students
  curriculum_design: 80,          // Structuring learning
  student_engagement: 85,         // Motivating learners
  assessment_design: 75,          // Creating evaluations
  educational_technology: 70      // Using EdTech tools
}
```

---

## Best Practices

### DO ✅

1. **Research First**: Spend adequate time understanding the industry before creating careers
2. **Use Vietnamese Sources**: Prioritize Vietnam job boards for salary and role data
3. **Start Broad**: Cover the full career ladder (intern to executive)
4. **Be Realistic**: Base A-factors on actual job requirements, not ideals
5. **Test Your Seed**: Run the seed file multiple times to verify upsert logic
6. **Document Industry Notes**: Create a summary MD file for complex sectors
7. **Consult Examples**: Reference existing seeds (marketing, IR) for patterns
8. **Version Control**: Commit frequently with descriptive messages

### DON'T ❌

1. **Don't Copy-Paste A-Factors**: Each role needs unique requirements
2. **Don't Use USD Salaries**: Always convert to VND and verify local rates
3. **Don't Skip Vietnamese Names**: All careers need vietnameseName field
4. **Don't Create Orphan Files**: Always integrate into main seed.ts
5. **Don't Forget package.json**: Add individual seed script for testing
6. **Don't Assume**: Verify salary data with multiple sources
7. **Don't Rush**: Quality over quantity - 30 well-researched careers > 60 rushed ones
8. **Don't Ignore Progression**: Ensure logical skill/salary increases across levels

---

## Quick Reference

### Standard Career Progression Template

| Level | Experience | Salary Range | A1 Avg | A2 Avg | A3 Autonomy |
|-------|-----------|-------------|--------|--------|-------------|
| Intern | 0-6 mo | 2M - 7M | 60-70 | 50-65 | 20-35 |
| Entry | 0-2 yr | 8M - 15M | 65-75 | 60-75 | 25-40 |
| Mid | 2-5 yr | 15M - 30M | 70-80 | 70-85 | 40-60 |
| Senior | 5-8 yr | 30M - 60M | 75-85 | 80-90 | 55-75 |
| Lead/Mgr | 8-12 yr | 50M - 100M | 80-90 | 85-95 | 65-85 |
| Director | 12-15 yr | 80M - 150M | 85-95 | 90-95 | 75-90 |
| Executive | 15+ yr | 120M - 300M+ | 90-95 | 90-100 | 85-95 |

### Industry Icons for Logging

Use these emojis in seed functions for clear console output:

- 📊 Marketing / Business
- 💰 Finance / Banking
- 🌍 International Relations / NGO
- 🎨 Creative / Design
- 📚 Education / Training
- 🏥 Healthcare / Medical
- 💻 Technology / Software
- 🏛️ Government / Public Sector
- 🏨 Hospitality / Tourism
- 🔬 Science / Research
- ⚖️ Law / Legal
- 🏗️ Engineering / Construction

---

## Commit Message Template

When committing new career seeds:

```
feat: Add {Industry} career database ({X} careers)

- Created {X} careers across {Y} progression tracks
- Researched Vietnam market salaries from {sources}
- Includes entry-level to executive paths
- Industry-specific A2 skills: {skill1, skill2, skill3}
- Salary ranges: {min} - {max} VND
- Added individual seed script to package.json

Tracks included:
- {Track 1} ({count} careers)
- {Track 2} ({count} careers)
- {Track 3} ({count} careers)
```

**Example**:
```
feat: Add Finance career database (38 careers)

- Created 38 careers across 5 progression tracks
- Researched Vietnam market salaries from VietnamWorks 2026 survey
- Includes banking intern to CFO paths
- Industry-specific A2 skills: quantitative_analysis, financial_modeling, risk_assessment
- Salary ranges: 2M - 250M VND
- Added individual seed script to package.json

Tracks included:
- Banking (7 careers)
- Corporate Finance (7 careers)
- Investment Banking (6 careers)
- Accounting (7 careers)
- FinTech (5 careers)
- Consulting (6 careers)
```

---

## Troubleshooting

### Common Issues

**Issue**: Upsert creating duplicates instead of updating

**Solution**:
- Verify `where: { name: careerData.name }` uses exact same name
- Check for trailing spaces or special characters in names
- Run `npx prisma studio` to manually check for duplicates

---

**Issue**: Salary data seems unrealistic

**Solution**:
- Cross-reference with 3+ Vietnamese job boards
- Check if using monthly vs. annual (should be monthly range)
- Verify industry multipliers (finance higher, NGO lower)
- Consult latest salary surveys (2025-2026)

---

**Issue**: A-factor scores seem arbitrary

**Solution**:
- Compare similar roles in existing seeds
- Ask: "Would someone with low [trait] succeed here?"
- Reference industry descriptions and job postings
- Use 0-100 scale meaningfully (don't cluster at 50-70)

---

**Issue**: Vietnamese translations feel unnatural

**Solution**:
- Check VietnamWorks for how Vietnamese companies list roles
- Consult native Vietnamese speakers
- Avoid direct word-for-word translation
- Use professional/formal register

---

## Future Enhancements

**Planned Improvements** (track here):
- [ ] Add `industry` field to Career model for filtering
- [ ] Create `sector` tags (e.g., "private", "public", "nonprofit")
- [ ] Add `educationRequired` field (high school, bachelor's, master's)
- [ ] Include `typicalMajors` array for relevant university degrees
- [ ] Add `remoteWorkPotential` field (0-100)
- [ ] Create `geographicAvailability` (Hanoi, HCMC, Da Nang, etc.)
- [ ] Build admin dashboard for career CRUD operations
- [ ] Implement career similarity scoring for "related careers"

---

## Version History

- **v1.0** (Feb 2026): Initial guide created with Marketing + IR examples
- **v1.1** (TBD): Add finance, creative, education examples
- **v2.0** (TBD): Include Deep version career requirements

---

**Next Steps**: Choose an industry from the priority list and follow this workflow to create your first new career sector!
