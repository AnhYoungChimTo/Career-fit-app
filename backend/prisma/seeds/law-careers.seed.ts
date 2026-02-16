import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Law & Legal Careers Seed Data
 * 55 comprehensive legal career profiles covering Vietnam domestic, international firms in Vietnam,
 * and international markets (US, UK, Singapore, Hong Kong)
 *
 * CAREER PROGRESSION PATHS:
 *
 * Vietnam Private Practice Track (Law Firms):
 * Legal Intern → Trainee Lawyer → Junior Associate → Associate → Senior Associate → Partner → Managing Partner
 *
 * Vietnam In-House Counsel Track (Corporate):
 * Legal Intern (Corporate) → Legal Officer → Legal Counsel → Senior Legal Counsel → Head of Legal → General Counsel / Chief Legal Officer
 *
 * Vietnam Government & Public Sector Track:
 * Legal Clerk → Government Legal Officer → Procurator (Prosecutor) → Senior Procurator → Judge → Chief Judge
 *
 * International Law Firm Track (US Big Law):
 * Summer Associate → Junior Associate → Mid-Level Associate → Senior Associate → Counsel → Partner → Managing Partner
 *
 * International Law Firm Track (UK Magic Circle):
 * Trainee Solicitor → Newly Qualified (NQ) → Associate → Senior Associate → Counsel → Partner → Managing Partner
 *
 * International Law Firm Track (Singapore):
 * Training Contract / Practice Trainee → Associate → Senior Associate → Partner → Managing Partner
 *
 * Specialized Legal Track:
 * Compliance Officer → Senior Compliance Officer → Head of Compliance → Chief Compliance Officer
 * IP Paralegal → IP Associate → Senior IP Counsel → Head of IP
 * Arbitration Intern → Arbitration Associate → International Arbitrator
 *
 * KEY FIRMS REFERENCED:
 * Vietnam: VILAF, YKVN, Rajah & Tann LCT, Phong & Partners, Baker McKenzie (VN), Freshfields (VN), Hogan Lovells (VN)
 * US: Cravath, Sullivan & Cromwell, Davis Polk, Skadden, Wachtell, Simpson Thacher
 * UK: Clifford Chance, Allen & Overy (A&O Shearman), Freshfields, Linklaters, Slaughter and May
 * Singapore: Rajah & Tann, Allen & Gledhill, WongPartnership, Drew & Napier
 *
 * SALARY DATA SOURCES (2025-2026):
 * - VietnamWorks, Glassdoor Vietnam, Salary Expert Vietnam
 * - Biglaw Investor (US associate salary scale)
 * - Legal Cheek (UK NQ salary tracker)
 * - Taylor Root Singapore Law Firm Salary Guide 2025
 * - Mercer Vietnam Compensation Report
 *
 * NOTES ON GEOGRAPHIC ARBITRAGE:
 * - US Big Law 1st year associate: ~$225,000/yr (~5.7B VND) vs Vietnam 1st year: ~530M VND/yr (10x gap)
 * - UK Magic Circle NQ: ~£150,000/yr (~4.8B VND) vs Vietnam equivalent: ~400M VND/yr (8x gap)
 * - Singapore associate: SGD 100,000-150,000/yr (~1.9-2.8B VND) vs Vietnam: ~400M VND/yr (5x gap)
 * - Vietnam salaries at international firms (Baker McKenzie, Freshfields) are 2-3x higher than domestic firms
 */

const lawCareers = [
  // ==========================================
  // TRACK 1: VIETNAM PRIVATE PRACTICE (14 careers)
  // Covers: Domestic law firms (VILAF, YKVN, Phong & Partners)
  //         + International firms' Vietnam offices (Baker McKenzie, Freshfields, Hogan Lovells)
  // ==========================================

  // INTERN / TRAINEE LEVEL (0-1 years)

  {
    name: 'Legal Intern (Vietnam Law Firm)',
    vietnameseName: 'Thực tập sinh Pháp lý (Công ty Luật Việt Nam)',
    description:
      'Entry-level internship at Vietnamese law firms such as VILAF, YKVN, Rajah & Tann LCT, or Phong & Partners. Assists lawyers with legal research, document drafting, case file organization, and client meeting preparation. Requires enrollment in or completion of a Vietnamese LLB program. Country: Vietnam. Typical firms: VILAF (Tier 1), YKVN, Rajah & Tann LCT Lawyers, Phong & Partners. Application period: Year-round, with peak recruitment in Q1 and Q3.',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 80, // Precision matters in law
        extraversion: 50,
        agreeableness: 75, // Team player
        neuroticism: 40,
        eq_emotional_intelligence: 60,
        adaptability: 75,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 70,
        creativity: 40,
        technical_aptitude: 55,
        communication_written: 75, // Legal writing
        communication_verbal: 60,
        attention_to_detail: 85, // Critical for legal work
        time_management: 65,
        digital_literacy: 65,
        learning_agility: 90, // Must absorb legal knowledge fast
        legal_research: 75,
        legal_writing: 70,
      },
      a3: {
        work_life_balance: 70,
        creativity_vs_structure: 25, // Highly structured
        autonomy_vs_guidance: 20, // Needs heavy mentorship
        impact_vs_money: 50,
        stability_vs_growth: 65,
        collaboration_vs_solo: 60,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '3,000,000 - 7,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'very_high',
  },

  {
    name: 'Legal Intern (International Firm - Vietnam Office)',
    vietnameseName: 'Thực tập sinh Pháp lý (Hãng Luật Quốc tế - VP Việt Nam)',
    description:
      'Internship at international law firms with Vietnam offices such as Baker McKenzie (Hanoi & HCMC, est. 1993), Freshfields Bruckhaus Deringer (HCMC), or Hogan Lovells (Hanoi & HCMC). Higher English requirements and exposure to cross-border transactions. Assists with M&A due diligence, FDI advisory, and international arbitration research. Country: Vietnam. Typical firms: Baker McKenzie, Freshfields, Hogan Lovells, Allen & Overy (A&O Shearman). Requirements: IELTS 7.0+ or equivalent, Vietnamese LLB. Application period: Structured summer programs (apply by Feb-Mar) and rolling internships.',
    requirements: {
      a1: {
        openness: 75, // International exposure
        conscientiousness: 85,
        extraversion: 55,
        agreeableness: 75,
        neuroticism: 35,
        eq_emotional_intelligence: 65,
        adaptability: 80,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 75,
        creativity: 45,
        technical_aptitude: 60,
        communication_written: 80,
        communication_verbal: 70,
        attention_to_detail: 90,
        time_management: 70,
        digital_literacy: 70,
        learning_agility: 90,
        legal_research: 80,
        legal_writing: 75,
        cross_cultural_competence: 75,
        language_skills: 85, // English proficiency critical
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 20,
        impact_vs_money: 40,
        stability_vs_growth: 60,
        collaboration_vs_solo: 65,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '5,000,000 - 10,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Trainee Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Tập sự (Việt Nam)',
    description:
      'Post-graduation trainee position required for Vietnamese lawyer licensing. Must complete 12-month apprenticeship under a licensed lawyer before taking the Bar exam. Handles supervised case work, legal drafting, court filings, and client correspondence. Country: Vietnam. Requirement: Vietnamese LLB + Legal Practicing Certificate (Chứng chỉ hành nghề luật sư). Firms: All Vietnamese law firms and international firms\' Vietnam offices.',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 85,
        extraversion: 55,
        agreeableness: 70,
        neuroticism: 40,
        eq_emotional_intelligence: 65,
        adaptability: 75,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 75,
        creativity: 45,
        technical_aptitude: 60,
        communication_written: 80,
        communication_verbal: 70,
        attention_to_detail: 85,
        time_management: 70,
        digital_literacy: 65,
        learning_agility: 85,
        legal_research: 80,
        legal_writing: 80,
        case_management: 60,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 25,
        impact_vs_money: 50,
        stability_vs_growth: 55,
        collaboration_vs_solo: 60,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '7,000,000 - 12,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Junior Associate (Vietnam Law Firm)',
    vietnameseName: 'Luật sư Sơ cấp (Công ty Luật Việt Nam)',
    description:
      'First post-qualification role at Vietnamese law firms. Handles independent case work under supervision, drafts contracts, conducts due diligence, and attends court hearings. Typical practice areas: corporate/M&A, banking & finance, real estate, dispute resolution. Country: Vietnam. Typical firms: VILAF (14 partners, ~70 lawyers), YKVN, Rajah & Tann LCT (6 partners, 40+ associates). Salary at international firms (Baker McKenzie VN): 2-3x higher than domestic firms.',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 85,
        extraversion: 55,
        agreeableness: 65,
        neuroticism: 35,
        eq_emotional_intelligence: 70,
        adaptability: 70,
        stress_tolerance: 70,
      },
      a2: {
        analytical_thinking: 80,
        creativity: 50,
        technical_aptitude: 65,
        communication_written: 85,
        communication_verbal: 75,
        attention_to_detail: 90,
        time_management: 75,
        digital_literacy: 70,
        learning_agility: 80,
        legal_research: 85,
        legal_writing: 85,
        case_management: 70,
        negotiation: 60,
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 35,
        impact_vs_money: 45,
        stability_vs_growth: 50,
        collaboration_vs_solo: 60,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '12,000,000 - 25,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Associate (Vietnam - International Firm)',
    vietnameseName: 'Luật sư (Hãng Luật Quốc tế - VP Việt Nam)',
    description:
      'Associate at international firm\'s Vietnam office (1-3 years PQE). Works on cross-border M&A, FDI advisory, banking & finance, and international arbitration. Bilingual legal drafting in English and Vietnamese. Opportunity for secondments to regional offices (Singapore, Hong Kong, London). Country: Vietnam. Typical firms: Baker McKenzie (Hanoi/HCMC), Freshfields (HCMC), Hogan Lovells (Hanoi/HCMC). Requirements: Vietnamese Bar + IELTS 7.5+ or equivalent.',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 90,
        extraversion: 60,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 75,
        adaptability: 80,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 55,
        technical_aptitude: 70,
        communication_written: 90,
        communication_verbal: 80,
        attention_to_detail: 92,
        time_management: 80,
        digital_literacy: 75,
        learning_agility: 80,
        legal_research: 90,
        legal_writing: 90,
        cross_cultural_competence: 80,
        language_skills: 90,
        negotiation: 70,
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 45,
        impact_vs_money: 35,
        stability_vs_growth: 45,
        collaboration_vs_solo: 65,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '25,000,000 - 47,000,000',
    workHoursPerWeek: 50,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Senior Associate (Vietnam Law Firm)',
    vietnameseName: 'Luật sư Cao cấp (Công ty Luật Việt Nam)',
    description:
      'Senior lawyer at Vietnamese firm (5-8 years PQE). Leads transactions independently, manages junior associates, develops client relationships, and specializes in key practice areas. Top practice areas in Vietnam (2026): Corporate/M&A, Banking & Finance, Real Estate, Data Privacy & Compliance, Projects & Infrastructure. Country: Vietnam. Typical firms: VILAF, YKVN, Rajah & Tann LCT. Senior associates at Tier 1 firms earn significantly more.',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 90,
        extraversion: 65,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 80,
        adaptability: 75,
        stress_tolerance: 80,
        leadership: 75,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 60,
        technical_aptitude: 70,
        communication_written: 90,
        communication_verbal: 85,
        attention_to_detail: 90,
        time_management: 85,
        digital_literacy: 75,
        legal_research: 90,
        legal_writing: 90,
        case_management: 85,
        negotiation: 80,
        client_relationship: 80,
        business_development: 65,
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 65,
        impact_vs_money: 40,
        stability_vs_growth: 45,
        collaboration_vs_solo: 65,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '40,000,000 - 70,000,000',
    workHoursPerWeek: 50,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'Senior Associate (Vietnam - International Firm)',
    vietnameseName: 'Luật sư Cao cấp (Hãng Luật Quốc tế - VP Việt Nam)',
    description:
      'Senior associate at international firm\'s Vietnam office (5-8 years PQE). Leads complex cross-border deals, manages deal teams, and serves as primary contact for international clients. Handles matters worth $50M-$500M+. Strong pipeline to partnership. Country: Vietnam. Typical firms: Baker McKenzie, Freshfields, Hogan Lovells. Salary: ~83-86M VND/month at top international firms.',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 92,
        extraversion: 65,
        agreeableness: 65,
        neuroticism: 25,
        eq_emotional_intelligence: 82,
        adaptability: 80,
        stress_tolerance: 85,
        leadership: 80,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 60,
        technical_aptitude: 75,
        communication_written: 92,
        communication_verbal: 88,
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 78,
        legal_research: 90,
        legal_writing: 92,
        cross_cultural_competence: 85,
        negotiation: 85,
        client_relationship: 85,
        business_development: 70,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 70,
        impact_vs_money: 30,
        stability_vs_growth: 40,
        collaboration_vs_solo: 65,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '65,000,000 - 100,000,000',
    workHoursPerWeek: 55,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Partner (Vietnam Law Firm)',
    vietnameseName: 'Luật sư Thành viên / Đối tác (Công ty Luật Việt Nam)',
    description:
      'Equity or salaried partner at a leading Vietnamese law firm (10-15+ years PQE). Owns client relationships, leads major transactions, develops the firm\'s strategy, and mentors the next generation of lawyers. Responsible for business development and firm profitability. Country: Vietnam. Typical firms: VILAF (14 partners), YKVN, Rajah & Tann LCT (6 partners). Partnership track typically 10-15 years from qualification.',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 92,
        extraversion: 75,
        agreeableness: 60,
        neuroticism: 25,
        eq_emotional_intelligence: 88,
        adaptability: 75,
        stress_tolerance: 90,
        leadership: 90,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 65,
        technical_aptitude: 70,
        communication_written: 92,
        communication_verbal: 92,
        attention_to_detail: 88,
        time_management: 90,
        digital_literacy: 70,
        legal_research: 85,
        legal_writing: 90,
        negotiation: 92,
        client_relationship: 95,
        business_development: 90,
        strategic_thinking: 90,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 90,
        impact_vs_money: 35,
        stability_vs_growth: 40,
        collaboration_vs_solo: 70,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '120,000,000 - 250,000,000',
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  {
    name: 'Managing Partner (Vietnam Law Firm)',
    vietnameseName: 'Luật sư Điều hành (Công ty Luật Việt Nam)',
    description:
      'Head of a Vietnamese law firm responsible for overall firm management, strategic direction, major client relationships, and representing the firm in the legal community. Combines legal excellence with business leadership. Country: Vietnam. Firms: VILAF, YKVN, and other Tier 1-2 Vietnamese firms. Often also serves as senior advisor to government and industry bodies (VCCI, Vietnam Lawyers Association).',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 95,
        extraversion: 80,
        agreeableness: 60,
        neuroticism: 20,
        eq_emotional_intelligence: 92,
        adaptability: 78,
        stress_tolerance: 92,
        leadership: 95,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 65,
        technical_aptitude: 65,
        communication_written: 90,
        communication_verbal: 95,
        attention_to_detail: 85,
        time_management: 92,
        digital_literacy: 65,
        negotiation: 95,
        client_relationship: 95,
        business_development: 95,
        strategic_thinking: 95,
        firm_management: 90,
      },
      a3: {
        work_life_balance: 20,
        creativity_vs_structure: 50,
        autonomy_vs_guidance: 95,
        impact_vs_money: 40,
        stability_vs_growth: 45,
        collaboration_vs_solo: 75,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '200,000,000 - 500,000,000+',
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  // Additional Vietnam Private Practice Specializations

  {
    name: 'Litigation Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Tranh tụng (Việt Nam)',
    description:
      'Litigation specialist representing clients in Vietnamese courts and arbitration tribunals. Handles commercial disputes, employment claims, real estate disputes, and debt recovery. Appears before People\'s Courts at district, provincial, and appellate levels. Country: Vietnam. Firms: VILAF (strong dispute resolution practice), YKVN, domestic litigation boutiques. Growing demand in commercial arbitration (VIAC - Vietnam International Arbitration Centre).',
    requirements: {
      a1: {
        openness: 60,
        conscientiousness: 90,
        extraversion: 75, // Court appearances
        agreeableness: 50, // Adversarial role
        neuroticism: 25,
        eq_emotional_intelligence: 80,
        adaptability: 75,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 65,
        technical_aptitude: 60,
        communication_written: 90,
        communication_verbal: 95, // Oral advocacy
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 65,
        legal_research: 92,
        legal_writing: 92,
        negotiation: 85,
        persuasion: 90,
        case_management: 88,
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 60,
        impact_vs_money: 45,
        stability_vs_growth: 50,
        collaboration_vs_solo: 50,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '25,000,000 - 60,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'Corporate / M&A Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Doanh nghiệp / M&A (Việt Nam)',
    description:
      'Transactional lawyer specializing in mergers, acquisitions, joint ventures, and FDI advisory in Vietnam. Leads due diligence, drafts transaction documents, advises on regulatory approvals, and coordinates with international counsel. Vietnam FDI surpassed $40B in 2025 (~40% increase), driving massive demand. Country: Vietnam. Top firms: Baker McKenzie (market leader in corporate/M&A), VILAF, Freshfields, YKVN. Hot practice area due to new Investment Law 2026.',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 92,
        extraversion: 65,
        agreeableness: 60,
        neuroticism: 28,
        eq_emotional_intelligence: 78,
        adaptability: 80,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 55,
        technical_aptitude: 70,
        communication_written: 90,
        communication_verbal: 82,
        attention_to_detail: 95,
        time_management: 85,
        digital_literacy: 75,
        legal_research: 88,
        legal_writing: 90,
        negotiation: 85,
        financial_modeling: 60,
        regulatory_knowledge: 85,
        cross_cultural_competence: 75,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 55,
        impact_vs_money: 30,
        stability_vs_growth: 40,
        collaboration_vs_solo: 70,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '30,000,000 - 80,000,000',
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  {
    name: 'Banking & Finance Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Ngân hàng & Tài chính (Việt Nam)',
    description:
      'Advises banks, financial institutions, and borrowers on lending, structured finance, project finance, and capital markets in Vietnam. Drafts loan agreements, security documents, and regulatory filings. Works with SBV (State Bank of Vietnam) regulations and SSC (State Securities Commission) requirements. Country: Vietnam. Firms: Baker McKenzie, Freshfields, VILAF, Rajah & Tann LCT. Growing demand from infrastructure projects and green finance.',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 95,
        extraversion: 55,
        agreeableness: 60,
        neuroticism: 28,
        eq_emotional_intelligence: 72,
        adaptability: 72,
        stress_tolerance: 82,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 50,
        technical_aptitude: 75,
        communication_written: 90,
        communication_verbal: 78,
        attention_to_detail: 95,
        time_management: 85,
        digital_literacy: 72,
        legal_research: 88,
        legal_writing: 90,
        financial_modeling: 70,
        regulatory_knowledge: 90,
        quantitative_analysis: 75,
      },
      a3: {
        work_life_balance: 35,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 50,
        impact_vs_money: 30,
        stability_vs_growth: 45,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '30,000,000 - 85,000,000',
    workHoursPerWeek: 52,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Real Estate & Construction Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Bất động sản & Xây dựng (Việt Nam)',
    description:
      'Advises on real estate transactions, construction projects, land use rights, and property development in Vietnam. Handles due diligence on land titles, drafts sale/lease agreements, advises on foreign ownership restrictions, and navigates complex land law. Country: Vietnam. Firms: Hogan Lovells (strong real estate practice), VILAF, Rajah & Tann LCT, Baker McKenzie. Key laws: Land Law 2024 (effective Jan 2025), Housing Law, Real Estate Business Law.',
    requirements: {
      a1: {
        openness: 60,
        conscientiousness: 90,
        extraversion: 60,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 72,
        adaptability: 70,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 50,
        technical_aptitude: 65,
        communication_written: 88,
        communication_verbal: 78,
        attention_to_detail: 92,
        time_management: 80,
        digital_literacy: 68,
        legal_research: 88,
        legal_writing: 88,
        negotiation: 80,
        regulatory_knowledge: 90,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 55,
        impact_vs_money: 35,
        stability_vs_growth: 50,
        collaboration_vs_solo: 60,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '25,000,000 - 70,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Data Privacy & Compliance Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Bảo mật Dữ liệu & Tuân thủ (Việt Nam)',
    description:
      'Emerging specialty advising on Vietnam\'s comprehensive personal data protection regime (Decree 13/2023/ND-CP and subsequent regulations). Helps companies establish data processing frameworks, conduct privacy impact assessments, draft privacy policies, and ensure compliance with cross-border data transfer requirements. Country: Vietnam. Firms: Baker McKenzie, Freshfields, Hogan Lovells, VILAF. Fastest-growing legal practice area in Vietnam (2025-2026) due to new data privacy laws.',
    requirements: {
      a1: {
        openness: 78,
        conscientiousness: 90,
        extraversion: 55,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 70,
        adaptability: 85, // Rapidly evolving field
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 60,
        technical_aptitude: 82, // Must understand tech
        communication_written: 88,
        communication_verbal: 75,
        attention_to_detail: 92,
        time_management: 80,
        digital_literacy: 85,
        legal_research: 85,
        legal_writing: 88,
        regulatory_knowledge: 92,
        cross_cultural_competence: 75,
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 55,
        impact_vs_money: 45,
        stability_vs_growth: 50,
        collaboration_vs_solo: 60,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '25,000,000 - 65,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  // ==========================================
  // TRACK 2: VIETNAM IN-HOUSE COUNSEL (7 careers)
  // Covers: Corporate legal departments at MNCs, Vietnamese conglomerates, tech companies
  // ==========================================

  {
    name: 'Legal Officer (In-House - Vietnam)',
    vietnameseName: 'Nhân viên Pháp chế (Doanh nghiệp Việt Nam)',
    description:
      'Entry-level in-house legal position at Vietnamese companies or MNC Vietnam offices. Reviews contracts, ensures regulatory compliance, supports HR on employment matters, and maintains legal documentation. Better work-life balance than private practice but lower salary. Country: Vietnam. Typical employers: VinGroup, FPT, Viettel, Masan, banks (Vietcombank, Techcombank), MNC Vietnam offices (Samsung, Intel, Nike). Requirements: Vietnamese LLB, 0-2 years experience.',
    requirements: {
      a1: {
        openness: 60,
        conscientiousness: 82,
        extraversion: 55,
        agreeableness: 72,
        neuroticism: 35,
        eq_emotional_intelligence: 68,
        adaptability: 70,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 75,
        creativity: 45,
        technical_aptitude: 65,
        communication_written: 80,
        communication_verbal: 70,
        attention_to_detail: 85,
        time_management: 75,
        digital_literacy: 72,
        learning_agility: 78,
        legal_research: 78,
        legal_writing: 78,
        regulatory_knowledge: 72,
      },
      a3: {
        work_life_balance: 65,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 30,
        impact_vs_money: 45,
        stability_vs_growth: 60,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '10,000,000 - 18,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Legal Counsel (In-House - Vietnam)',
    vietnameseName: 'Chuyên viên Pháp chế (Doanh nghiệp Việt Nam)',
    description:
      'Mid-level in-house lawyer (2-5 years PQE) managing legal matters for a Vietnamese company or MNC. Drafts and negotiates commercial contracts, advises on corporate governance, handles regulatory filings, and manages external counsel relationships. Country: Vietnam. Typical employers: MNCs (Samsung Vietnam, Intel Vietnam, Unilever Vietnam), Vietnamese conglomerates (VinGroup, Masan), tech companies (VNG, Tiki). Average salary ~24.6M VND/month (Salary Expert 2025).',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 85,
        extraversion: 60,
        agreeableness: 70,
        neuroticism: 32,
        eq_emotional_intelligence: 75,
        adaptability: 75,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 82,
        creativity: 55,
        technical_aptitude: 70,
        communication_written: 85,
        communication_verbal: 78,
        attention_to_detail: 88,
        time_management: 80,
        digital_literacy: 75,
        legal_research: 82,
        legal_writing: 85,
        negotiation: 78,
        regulatory_knowledge: 80,
        business_acumen: 70,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 50,
        impact_vs_money: 45,
        stability_vs_growth: 55,
        collaboration_vs_solo: 70,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '18,000,000 - 35,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Senior Legal Counsel (In-House - Vietnam)',
    vietnameseName: 'Chuyên viên Pháp chế Cao cấp (Doanh nghiệp Việt Nam)',
    description:
      'Senior in-house lawyer (5-10 years PQE) providing strategic legal advice to business units. Manages complex transactions, oversees compliance programs, handles disputes, and trains junior legal team members. Country: Vietnam. Typical employers: Major MNCs, top Vietnamese banks, listed companies. Salary at senior level (~10+ years): ~31-33M VND/month at average firms, higher at international MNCs.',
    requirements: {
      a1: {
        openness: 68,
        conscientiousness: 88,
        extraversion: 65,
        agreeableness: 68,
        neuroticism: 28,
        eq_emotional_intelligence: 80,
        adaptability: 78,
        stress_tolerance: 78,
        leadership: 72,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 60,
        technical_aptitude: 72,
        communication_written: 88,
        communication_verbal: 82,
        attention_to_detail: 88,
        time_management: 85,
        digital_literacy: 75,
        legal_research: 85,
        legal_writing: 88,
        negotiation: 85,
        regulatory_knowledge: 85,
        business_acumen: 80,
        client_relationship: 78,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 65,
        impact_vs_money: 45,
        stability_vs_growth: 55,
        collaboration_vs_solo: 68,
        variety_vs_routine: 62,
      },
    },
    avgSalaryVND: '35,000,000 - 60,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'Head of Legal (In-House - Vietnam)',
    vietnameseName: 'Trưởng phòng Pháp chế (Doanh nghiệp Việt Nam)',
    description:
      'Leads the legal department of a Vietnamese company or MNC Vietnam subsidiary (10-15 years PQE). Manages legal team (3-10 lawyers), sets legal strategy, manages external law firm relationships, advises C-suite on risk and governance. Reports to General Counsel or CEO. Country: Vietnam. Typical employers: Major Vietnamese corporations, regional MNC headquarters, mid-size international companies in Vietnam.',
    requirements: {
      a1: {
        openness: 68,
        conscientiousness: 90,
        extraversion: 72,
        agreeableness: 65,
        neuroticism: 25,
        eq_emotional_intelligence: 85,
        adaptability: 78,
        stress_tolerance: 82,
        leadership: 85,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 60,
        technical_aptitude: 70,
        communication_written: 88,
        communication_verbal: 88,
        attention_to_detail: 85,
        time_management: 88,
        digital_literacy: 72,
        negotiation: 88,
        regulatory_knowledge: 85,
        business_acumen: 85,
        strategic_thinking: 85,
        team_management: 85,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 78,
        impact_vs_money: 40,
        stability_vs_growth: 50,
        collaboration_vs_solo: 72,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '60,000,000 - 120,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'General Counsel / Chief Legal Officer (Vietnam)',
    vietnameseName: 'Tổng Giám đốc Pháp chế / Giám đốc Pháp lý (Việt Nam)',
    description:
      'Top legal executive at a major Vietnamese corporation or MNC regional office (15+ years PQE). Oversees all legal, compliance, and governance matters. Member of executive leadership team. Advises Board of Directors on legal risk, M&A strategy, and regulatory matters. Country: Vietnam. Typical employers: VinGroup, FPT, Masan, Viettel, major banks, MNC regional HQs. Often holds both Vietnamese and foreign qualifications.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 92,
        extraversion: 78,
        agreeableness: 62,
        neuroticism: 20,
        eq_emotional_intelligence: 90,
        adaptability: 78,
        stress_tolerance: 90,
        leadership: 92,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 65,
        technical_aptitude: 68,
        communication_written: 90,
        communication_verbal: 92,
        attention_to_detail: 85,
        time_management: 90,
        digital_literacy: 70,
        negotiation: 92,
        regulatory_knowledge: 88,
        business_acumen: 92,
        strategic_thinking: 95,
        team_management: 88,
        client_relationship: 85,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 50,
        autonomy_vs_guidance: 90,
        impact_vs_money: 38,
        stability_vs_growth: 45,
        collaboration_vs_solo: 72,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '120,000,000 - 300,000,000',
    workHoursPerWeek: 52,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  {
    name: 'Compliance Officer (Vietnam)',
    vietnameseName: 'Nhân viên Tuân thủ (Việt Nam)',
    description:
      'Ensures company compliance with Vietnamese laws, regulations, and internal policies. Develops compliance programs, conducts risk assessments, trains staff, and investigates potential violations. Growing demand in banking, fintech, and MNCs. Country: Vietnam. Typical employers: Banks (Vietcombank, Techcombank, HSBC Vietnam), fintech companies, pharmaceutical firms, manufacturing MNCs. Key regulations: AML/CFT laws, data protection, anti-corruption.',
    requirements: {
      a1: {
        openness: 58,
        conscientiousness: 92,
        extraversion: 55,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 72,
        adaptability: 72,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 45,
        technical_aptitude: 68,
        communication_written: 82,
        communication_verbal: 75,
        attention_to_detail: 95,
        time_management: 80,
        digital_literacy: 75,
        legal_research: 80,
        legal_writing: 78,
        regulatory_knowledge: 92,
        risk_assessment: 85,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 20,
        autonomy_vs_guidance: 50,
        impact_vs_money: 50,
        stability_vs_growth: 60,
        collaboration_vs_solo: 60,
        variety_vs_routine: 45,
      },
    },
    avgSalaryVND: '15,000,000 - 35,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Head of Compliance (Vietnam)',
    vietnameseName: 'Trưởng phòng Tuân thủ (Việt Nam)',
    description:
      'Leads compliance function for major Vietnamese company or MNC Vietnam operations (8-15 years experience). Designs enterprise-wide compliance frameworks, manages regulatory relationships, oversees internal investigations, and reports to Board/Audit Committee. Country: Vietnam. Typical employers: Major banks, insurance companies, listed corporations, international MNCs. Reports to CEO or General Counsel.',
    requirements: {
      a1: {
        openness: 62,
        conscientiousness: 95,
        extraversion: 65,
        agreeableness: 62,
        neuroticism: 25,
        eq_emotional_intelligence: 82,
        adaptability: 72,
        stress_tolerance: 82,
        leadership: 82,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 50,
        technical_aptitude: 72,
        communication_written: 88,
        communication_verbal: 85,
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 75,
        regulatory_knowledge: 95,
        risk_assessment: 92,
        strategic_thinking: 85,
        team_management: 82,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 75,
        impact_vs_money: 48,
        stability_vs_growth: 55,
        collaboration_vs_solo: 65,
        variety_vs_routine: 52,
      },
    },
    avgSalaryVND: '60,000,000 - 130,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  // ==========================================
  // TRACK 3: VIETNAM GOVERNMENT & PUBLIC SECTOR (6 careers)
  // Covers: Procuracy, judiciary, government legal advisory
  // ==========================================

  {
    name: 'Legal Clerk (Vietnam Government)',
    vietnameseName: 'Thư ký Pháp lý (Cơ quan Nhà nước Việt Nam)',
    description:
      'Entry-level position in Vietnamese government legal departments (People\'s Courts, People\'s Procuracy, Ministry of Justice). Assists with case file management, legal research, document preparation, and administrative tasks. Country: Vietnam. Employers: People\'s Courts (Tòa án Nhân dân), People\'s Procuracy (Viện Kiểm sát Nhân dân), Ministry of Justice (Bộ Tư pháp). Requirements: Vietnamese LLB, pass civil service exam. Salary follows government pay scale (Decree 204/2004/NĐ-CP, updated).',
    requirements: {
      a1: {
        openness: 50,
        conscientiousness: 85,
        extraversion: 45,
        agreeableness: 70,
        neuroticism: 38,
        eq_emotional_intelligence: 60,
        adaptability: 60,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 70,
        creativity: 35,
        technical_aptitude: 55,
        communication_written: 78,
        communication_verbal: 60,
        attention_to_detail: 88,
        time_management: 72,
        digital_literacy: 60,
        learning_agility: 72,
        legal_research: 75,
        legal_writing: 72,
      },
      a3: {
        work_life_balance: 75,
        creativity_vs_structure: 15,
        autonomy_vs_guidance: 20,
        impact_vs_money: 60,
        stability_vs_growth: 80, // Very stable
        collaboration_vs_solo: 55,
        variety_vs_routine: 30,
      },
    },
    avgSalaryVND: '5,000,000 - 9,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'medium',
  },

  {
    name: 'Government Legal Officer (Vietnam)',
    vietnameseName: 'Chuyên viên Pháp luật (Cơ quan Nhà nước Việt Nam)',
    description:
      'Legal officer in Vietnamese government ministries or agencies (3-8 years). Drafts legal documents (normative acts, circulars, decrees), reviews regulations, provides legal opinions, and assists in policy development. Country: Vietnam. Employers: Ministry of Justice, Ministry of Industry and Trade, Ministry of Finance, provincial-level Departments of Justice. Career path to senior specialist or department head.',
    requirements: {
      a1: {
        openness: 55,
        conscientiousness: 88,
        extraversion: 50,
        agreeableness: 68,
        neuroticism: 35,
        eq_emotional_intelligence: 65,
        adaptability: 62,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 80,
        creativity: 45,
        technical_aptitude: 58,
        communication_written: 85,
        communication_verbal: 68,
        attention_to_detail: 90,
        time_management: 75,
        digital_literacy: 62,
        legal_research: 85,
        legal_writing: 88,
        regulatory_knowledge: 85,
      },
      a3: {
        work_life_balance: 72,
        creativity_vs_structure: 18,
        autonomy_vs_guidance: 35,
        impact_vs_money: 65,
        stability_vs_growth: 78,
        collaboration_vs_solo: 55,
        variety_vs_routine: 35,
      },
    },
    avgSalaryVND: '8,000,000 - 15,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'medium',
  },

  {
    name: 'Procurator / Prosecutor (Vietnam)',
    vietnameseName: 'Kiểm sát viên (Việt Nam)',
    description:
      'Public prosecutor at the People\'s Procuracy (Viện Kiểm sát Nhân dân). Investigates crimes, initiates prosecutions, oversees law enforcement activities, and supervises judicial proceedings. Represents the state in criminal cases. Country: Vietnam. Employer: People\'s Procuracy at district, provincial, or central level. Requirements: Vietnamese LLB, pass procuracy exam, minimum training period. Career path: Junior Procurator → Procurator → Senior Procurator → Chief Procurator.',
    requirements: {
      a1: {
        openness: 55,
        conscientiousness: 92,
        extraversion: 65,
        agreeableness: 50,
        neuroticism: 28,
        eq_emotional_intelligence: 75,
        adaptability: 65,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 50,
        technical_aptitude: 55,
        communication_written: 88,
        communication_verbal: 85,
        attention_to_detail: 92,
        time_management: 80,
        digital_literacy: 58,
        legal_research: 90,
        legal_writing: 88,
        persuasion: 82,
        case_management: 85,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 20,
        autonomy_vs_guidance: 45,
        impact_vs_money: 75,
        stability_vs_growth: 72,
        collaboration_vs_solo: 55,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '10,000,000 - 25,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'high',
    growthPotential: 'medium',
  },

  {
    name: 'Judge (Vietnam)',
    vietnameseName: 'Thẩm phán (Việt Nam)',
    description:
      'Presides over civil, criminal, administrative, or commercial cases in Vietnam\'s People\'s Courts (Tòa án Nhân dân). Hears evidence, applies law, renders judgments, and ensures fair proceedings. Requires extensive experience and passing the judges\' examination. Country: Vietnam. Employer: People\'s Courts at district, provincial, appellate, or Supreme Court level. Requirements: Vietnamese LLB, 5+ years legal experience, pass judges\' exam, appointed by President of Vietnam (for Supreme Court) or Chief Justice.',
    requirements: {
      a1: {
        openness: 60,
        conscientiousness: 95,
        extraversion: 60,
        agreeableness: 55,
        neuroticism: 20,
        eq_emotional_intelligence: 85,
        adaptability: 62,
        stress_tolerance: 85,
        leadership: 78,
      },
      a2: {
        analytical_thinking: 95,
        creativity: 50,
        technical_aptitude: 55,
        communication_written: 92,
        communication_verbal: 88,
        attention_to_detail: 95,
        time_management: 85,
        digital_literacy: 58,
        legal_research: 95,
        legal_writing: 95,
        case_management: 90,
        persuasion: 72, // Reasoning, not persuading
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 20,
        autonomy_vs_guidance: 80, // Independent judgment
        impact_vs_money: 80,
        stability_vs_growth: 75,
        collaboration_vs_solo: 45,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '15,000,000 - 35,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'high',
    growthPotential: 'medium',
  },

  {
    name: 'Notary Public (Vietnam)',
    vietnameseName: 'Công chứng viên (Việt Nam)',
    description:
      'Licensed notary authenticating legal documents, contracts, and transactions in Vietnam. Certifies signatures, verifies identities, and ensures documents meet legal requirements. Can operate through notary offices (state or private). Country: Vietnam. Employer: State notary offices (Phòng Công chứng) or private notary offices (Văn phòng Công chứng). Requirements: Vietnamese LLB, 5+ years legal experience, pass notary exam, appointed by provincial People\'s Committee. Stable income from notarization fees.',
    requirements: {
      a1: {
        openness: 45,
        conscientiousness: 95,
        extraversion: 55,
        agreeableness: 68,
        neuroticism: 30,
        eq_emotional_intelligence: 68,
        adaptability: 55,
        stress_tolerance: 62,
      },
      a2: {
        analytical_thinking: 78,
        creativity: 30,
        technical_aptitude: 55,
        communication_written: 82,
        communication_verbal: 72,
        attention_to_detail: 98, // Highest precision needed
        time_management: 78,
        digital_literacy: 60,
        legal_research: 75,
        legal_writing: 80,
        regulatory_knowledge: 85,
      },
      a3: {
        work_life_balance: 70,
        creativity_vs_structure: 10,
        autonomy_vs_guidance: 70,
        impact_vs_money: 45,
        stability_vs_growth: 85,
        collaboration_vs_solo: 40,
        variety_vs_routine: 25,
      },
    },
    avgSalaryVND: '15,000,000 - 40,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'medium',
  },

  {
    name: 'Bailiff / Enforcement Officer (Vietnam)',
    vietnameseName: 'Chấp hành viên (Việt Nam)',
    description:
      'Enforces court judgments and decisions in Vietnam. Responsible for executing civil judgments, seizing assets, organizing auctions, and ensuring compliance with court orders. Works within the Civil Judgment Enforcement Agency under the Ministry of Justice. Country: Vietnam. Employer: Civil Judgment Enforcement Agencies at district and provincial levels (Cục/Chi cục Thi hành án Dân sự). Requirements: Vietnamese LLB, pass enforcement officer exam.',
    requirements: {
      a1: {
        openness: 45,
        conscientiousness: 88,
        extraversion: 62,
        agreeableness: 52,
        neuroticism: 28,
        eq_emotional_intelligence: 70,
        adaptability: 65,
        stress_tolerance: 78,
      },
      a2: {
        analytical_thinking: 72,
        creativity: 35,
        technical_aptitude: 52,
        communication_written: 75,
        communication_verbal: 78,
        attention_to_detail: 85,
        time_management: 78,
        digital_literacy: 55,
        legal_research: 72,
        legal_writing: 72,
        negotiation: 75,
        case_management: 78,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 15,
        autonomy_vs_guidance: 45,
        impact_vs_money: 60,
        stability_vs_growth: 75,
        collaboration_vs_solo: 50,
        variety_vs_routine: 50,
      },
    },
    avgSalaryVND: '8,000,000 - 18,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'high',
    growthPotential: 'medium',
  },

  // ==========================================
  // TRACK 4: US BIG LAW (8 careers)
  // Covers: Major US law firms (Cravath, Sullivan & Cromwell, Skadden, Davis Polk, etc.)
  // Salary data: Cravath scale (2025-2026)
  // ==========================================

  {
    name: 'Summer Associate (US Big Law)',
    vietnameseName: 'Thực tập sinh Mùa hè (Luật Mỹ - Big Law)',
    description:
      'Paid summer internship (10-12 weeks) at major US law firms during law school. Rotates through practice groups, attends training, participates in pro bono work, and receives mentorship. Most summer associates receive return offers for full-time positions. Country: United States. Typical firms: Cravath, Sullivan & Cromwell, Davis Polk, Skadden, Wachtell, Simpson Thacher, Kirkland & Ellis, Latham & Watkins. Requirements: Enrolled in JD program at T14 law school (for Vietnamese: LLM at top US school + strong credentials). Application: OCI (On-Campus Interviews) in August, or direct application by September. Weekly salary: ~$4,300-$4,600/week (prorated from 1st year salary).',
    requirements: {
      a1: {
        openness: 78,
        conscientiousness: 88,
        extraversion: 68,
        agreeableness: 72,
        neuroticism: 35,
        eq_emotional_intelligence: 72,
        adaptability: 82,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 55,
        technical_aptitude: 68,
        communication_written: 88,
        communication_verbal: 78,
        attention_to_detail: 90,
        time_management: 78,
        digital_literacy: 72,
        learning_agility: 92,
        legal_research: 85,
        legal_writing: 85,
        cross_cultural_competence: 72,
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 25,
        impact_vs_money: 35,
        stability_vs_growth: 55,
        collaboration_vs_solo: 68,
        variety_vs_routine: 72,
      },
    },
    avgSalaryVND: '108,000,000 - 115,000,000', // ~$4,300-$4,600/week → ~$17,200-$18,400/month → ~430-460M VND/month equivalent; shown as monthly
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Junior Associate (US Big Law - 1st-3rd Year)',
    vietnameseName: 'Luật sư Sơ cấp (Luật Mỹ - Big Law, Năm 1-3)',
    description:
      'First through third year associate at a major US law firm. Performs legal research, drafts memoranda and agreements, assists on deal teams, reviews documents, and supports senior attorneys on complex transactions and litigation. Country: United States. Typical firms: Cravath-scale firms (180+ firms matching the scale). Base salary (2025-2026 Cravath scale): 1st year $225,000, 2nd year $235,000, 3rd year $260,000 + bonus $15,000-$50,000. Requirements: JD from accredited US law school, state Bar admission. For Vietnamese lawyers: LLM from T14 US law school + NY/CA Bar.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 90,
        extraversion: 60,
        agreeableness: 65,
        neuroticism: 32,
        eq_emotional_intelligence: 70,
        adaptability: 78,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 55,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 78,
        attention_to_detail: 92,
        time_management: 82,
        digital_literacy: 75,
        learning_agility: 85,
        legal_research: 92,
        legal_writing: 92,
        case_management: 72,
      },
      a3: {
        work_life_balance: 25, // Notorious for long hours
        creativity_vs_structure: 28,
        autonomy_vs_guidance: 30,
        impact_vs_money: 25,
        stability_vs_growth: 45,
        collaboration_vs_solo: 62,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '5,625,000,000 - 6,500,000,000', // $225K-$260K/yr → ~5.6-6.5B VND/yr (annual)
    workHoursPerWeek: 60,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  {
    name: 'Mid-Level Associate (US Big Law - 4th-5th Year)',
    vietnameseName: 'Luật sư Trung cấp (Luật Mỹ - Big Law, Năm 4-5)',
    description:
      'Fourth through fifth year associate taking on greater responsibility and client interaction. Manages discrete workstreams, supervises juniors, drafts complex agreements, and begins developing subject matter expertise. Country: United States. Base salary (Cravath scale): 4th year $310,000, 5th year $345,000 + bonus $50,000-$80,000. This is the critical period for partnership trajectory assessment. Firms: Same as junior associate + lateral movement between firms common at this level.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 92,
        extraversion: 65,
        agreeableness: 62,
        neuroticism: 28,
        eq_emotional_intelligence: 78,
        adaptability: 75,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 60,
        technical_aptitude: 75,
        communication_written: 92,
        communication_verbal: 85,
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 78,
        legal_research: 90,
        legal_writing: 92,
        negotiation: 78,
        case_management: 82,
        client_relationship: 72,
      },
      a3: {
        work_life_balance: 20,
        creativity_vs_structure: 32,
        autonomy_vs_guidance: 50,
        impact_vs_money: 25,
        stability_vs_growth: 42,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '7,750,000,000 - 8,625,000,000', // $310K-$345K/yr → ~7.75-8.6B VND/yr (annual)
    workHoursPerWeek: 60,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  {
    name: 'Senior Associate (US Big Law - 6th-8th Year)',
    vietnameseName: 'Luật sư Cao cấp (Luật Mỹ - Big Law, Năm 6-8)',
    description:
      'Senior associate running significant deal components or litigation matters. Manages teams of junior associates, has direct client contact, and is evaluated for partnership potential. Country: United States. Base salary (Cravath scale): 6th year $365,000, 7th year $375,000, 8th year $385,000 + bonus $80,000-$115,000. Many associates leave for in-house counsel roles or smaller firms at this stage. Firms: Cravath, Sullivan & Cromwell, Wachtell (highest bonuses), Skadden, Davis Polk.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 92,
        extraversion: 70,
        agreeableness: 60,
        neuroticism: 25,
        eq_emotional_intelligence: 82,
        adaptability: 75,
        stress_tolerance: 88,
        leadership: 78,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 62,
        technical_aptitude: 75,
        communication_written: 95,
        communication_verbal: 88,
        attention_to_detail: 90,
        time_management: 88,
        digital_literacy: 78,
        legal_research: 88,
        legal_writing: 92,
        negotiation: 85,
        case_management: 88,
        client_relationship: 82,
        business_development: 68,
      },
      a3: {
        work_life_balance: 18,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 68,
        impact_vs_money: 25,
        stability_vs_growth: 40,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '9,125,000,000 - 9,625,000,000', // $365K-$385K/yr → ~9.1-9.6B VND/yr (annual)
    workHoursPerWeek: 58,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  {
    name: 'Counsel (US Big Law)',
    vietnameseName: 'Cố vấn Pháp lý (Luật Mỹ - Big Law)',
    description:
      'Non-equity/senior position between associate and partner at US Big Law firms. Experienced attorneys who may not be on partnership track but provide valuable expertise. Often specialists in niche practice areas. Country: United States. Typical firms: All major US firms have counsel positions. Compensation: $400,000-$600,000+ base. For Vietnamese-qualified lawyers: very rare, usually requires 10+ years US experience.',
    requirements: {
      a1: {
        openness: 68,
        conscientiousness: 90,
        extraversion: 62,
        agreeableness: 62,
        neuroticism: 25,
        eq_emotional_intelligence: 80,
        adaptability: 72,
        stress_tolerance: 82,
        leadership: 72,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 62,
        technical_aptitude: 75,
        communication_written: 92,
        communication_verbal: 85,
        attention_to_detail: 90,
        time_management: 85,
        digital_literacy: 78,
        legal_research: 90,
        legal_writing: 92,
        negotiation: 85,
        client_relationship: 80,
        strategic_thinking: 82,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 38,
        autonomy_vs_guidance: 72,
        impact_vs_money: 35,
        stability_vs_growth: 55,
        collaboration_vs_solo: 58,
        variety_vs_routine: 52,
      },
    },
    avgSalaryVND: '10,000,000,000 - 15,000,000,000', // $400K-$600K/yr → ~10-15B VND/yr (annual)
    workHoursPerWeek: 52,
    stressLevel: 'high',
    growthPotential: 'medium',
  },

  {
    name: 'Partner (US Big Law)',
    vietnameseName: 'Đối tác / Luật sư Thành viên (Luật Mỹ - Big Law)',
    description:
      'Equity partner at a major US law firm. Owns a share of firm profits, manages major client relationships, leads practice groups, and drives firm strategy. Among the highest-paid legal professionals globally. Country: United States. Typical firms: Cravath, Wachtell (PPP ~$8M+), Sullivan & Cromwell, Skadden, Kirkland & Ellis (largest by revenue globally). Compensation: $1M-$10M+ (profit per partner varies widely). Partnership typically achieved at 8-10+ years. For Vietnamese lawyers: extremely rare, usually requires building significant book of business connecting US-Vietnam deals.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 95,
        extraversion: 80,
        agreeableness: 58,
        neuroticism: 20,
        eq_emotional_intelligence: 90,
        adaptability: 75,
        stress_tolerance: 92,
        leadership: 92,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 65,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 95,
        attention_to_detail: 88,
        time_management: 90,
        digital_literacy: 72,
        negotiation: 95,
        client_relationship: 98,
        business_development: 95,
        strategic_thinking: 95,
        team_management: 88,
      },
      a3: {
        work_life_balance: 15,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 92,
        impact_vs_money: 20,
        stability_vs_growth: 35,
        collaboration_vs_solo: 70,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '25,000,000,000 - 100,000,000,000+', // $1M-$4M+/yr equity partner → ~25-100B+ VND/yr (annual, varies hugely)
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  // ==========================================
  // TRACK 5: UK MAGIC CIRCLE (6 careers)
  // Covers: Clifford Chance, Allen & Overy (A&O Shearman), Freshfields, Linklaters, Slaughter and May
  // ==========================================

  {
    name: 'Trainee Solicitor (UK Magic Circle)',
    vietnameseName: 'Luật sư Tập sự (Luật Anh - Magic Circle)',
    description:
      'Two-year training contract at a Magic Circle law firm in London. Rotates through four practice areas (6 months each), gaining supervised experience in corporate, finance, litigation, and specialist areas. Highly competitive: ~3-5% acceptance rate. Country: United Kingdom (London). Typical firms: Clifford Chance, Allen & Overy (now A&O Shearman), Freshfields Bruckhaus Deringer, Linklaters, Slaughter and May. Salary: £55,000-£60,000 (1st year), £60,000-£65,000 (2nd year). Requirements: Qualifying law degree or GDL + SQE (Solicitors Qualifying Examination) since 2021. For Vietnamese: LLB/LLM from UK university + SQE.',
    requirements: {
      a1: {
        openness: 78,
        conscientiousness: 90,
        extraversion: 65,
        agreeableness: 72,
        neuroticism: 32,
        eq_emotional_intelligence: 72,
        adaptability: 85,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 52,
        technical_aptitude: 68,
        communication_written: 88,
        communication_verbal: 78,
        attention_to_detail: 90,
        time_management: 78,
        digital_literacy: 72,
        learning_agility: 92,
        legal_research: 85,
        legal_writing: 85,
        cross_cultural_competence: 72,
      },
      a3: {
        work_life_balance: 35,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 22,
        impact_vs_money: 32,
        stability_vs_growth: 50,
        collaboration_vs_solo: 68,
        variety_vs_routine: 78, // Rotation gives variety
      },
    },
    avgSalaryVND: '1,750,000,000 - 2,100,000,000', // £55-65K/yr → ~1.75-2.1B VND/yr (annual)
    workHoursPerWeek: 55,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Newly Qualified Solicitor (UK Magic Circle)',
    vietnameseName: 'Luật sư Mới được Công nhận (Luật Anh - Magic Circle)',
    description:
      'First post-qualification year (NQ) at a Magic Circle firm after completing the training contract. Chooses to qualify into a specific practice area. Significant salary jump from trainee level. Country: United Kingdom (London). NQ salary (2025-2026): Freshfields ~£150,000+, A&O Shearman ~£150,000, Clifford Chance ~£125,000, Linklaters ~£125,000, Slaughter and May ~£120,000 (Legal Cheek 2025). Some NQs may be seconded to overseas offices including Asia (Hong Kong, Singapore, Vietnam).',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 90,
        extraversion: 62,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 75,
        adaptability: 78,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 55,
        technical_aptitude: 72,
        communication_written: 90,
        communication_verbal: 82,
        attention_to_detail: 92,
        time_management: 82,
        digital_literacy: 75,
        legal_research: 88,
        legal_writing: 90,
        negotiation: 72,
        case_management: 75,
      },
      a3: {
        work_life_balance: 28,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 40,
        impact_vs_money: 28,
        stability_vs_growth: 45,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '3,800,000,000 - 4,800,000,000', // £120-150K/yr → ~3.8-4.8B VND/yr (annual)
    workHoursPerWeek: 58,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  {
    name: 'Senior Associate (UK Magic Circle)',
    vietnameseName: 'Luật sư Cao cấp (Luật Anh - Magic Circle)',
    description:
      'Senior associate at a Magic Circle firm (4-7 years PQE). Manages complex cross-border transactions, supervises junior associates and trainees, develops client relationships, and begins building a reputation in their practice area. Country: United Kingdom (London). Salary: £140,000-£240,000+ depending on firm and PQE (Roll On Friday / Legal Cheek 2025). Firms: Freshfields (associates earning up to ~£240,000 at top of scale), A&O Shearman, Clifford Chance, Linklaters.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 92,
        extraversion: 68,
        agreeableness: 62,
        neuroticism: 25,
        eq_emotional_intelligence: 82,
        adaptability: 75,
        stress_tolerance: 85,
        leadership: 78,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 60,
        technical_aptitude: 75,
        communication_written: 92,
        communication_verbal: 88,
        attention_to_detail: 92,
        time_management: 88,
        digital_literacy: 78,
        legal_research: 88,
        legal_writing: 92,
        negotiation: 85,
        client_relationship: 82,
        business_development: 68,
        cross_cultural_competence: 80,
      },
      a3: {
        work_life_balance: 22,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 65,
        impact_vs_money: 25,
        stability_vs_growth: 40,
        collaboration_vs_solo: 65,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '4,500,000,000 - 7,700,000,000', // £140-240K/yr → ~4.5-7.7B VND/yr (annual)
    workHoursPerWeek: 58,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  {
    name: 'Partner (UK Magic Circle)',
    vietnameseName: 'Đối tác / Luật sư Thành viên (Luật Anh - Magic Circle)',
    description:
      'Equity partner at a Magic Circle law firm. Leads major international transactions, manages key client relationships, and shares in firm profits. Among the most prestigious legal positions globally. Country: United Kingdom (London, with global reach). Firms: Freshfields (PEP ~£2M+), Clifford Chance (PEP ~£2M+), A&O Shearman, Linklaters, Slaughter and May. Partnership track: typically 10-14 years PQE. Profit per equity partner (PEP): £1.5M-£3M+. For Vietnamese lawyers: extremely rare at equity level; possible for those who build Asia-Pacific practice.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 95,
        extraversion: 78,
        agreeableness: 58,
        neuroticism: 18,
        eq_emotional_intelligence: 90,
        adaptability: 75,
        stress_tolerance: 92,
        leadership: 92,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 65,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 95,
        attention_to_detail: 88,
        time_management: 90,
        digital_literacy: 72,
        negotiation: 95,
        client_relationship: 98,
        business_development: 95,
        strategic_thinking: 95,
        cross_cultural_competence: 85,
      },
      a3: {
        work_life_balance: 15,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 92,
        impact_vs_money: 22,
        stability_vs_growth: 35,
        collaboration_vs_solo: 70,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '48,000,000,000 - 96,000,000,000+', // £1.5M-£3M+/yr PEP → ~48-96B+ VND/yr (annual)
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  // ==========================================
  // TRACK 6: SINGAPORE (5 careers)
  // Covers: Rajah & Tann, Allen & Gledhill, WongPartnership, Drew & Napier
  // Gateway market for Vietnamese lawyers seeking international experience
  // ==========================================

  {
    name: 'Practice Trainee (Singapore Law Firm)',
    vietnameseName: 'Luật sư Tập sự (Hãng Luật Singapore)',
    description:
      'Training contract (typically 6 months) at a Singapore law firm leading to admission to the Singapore Bar. Rotates through departments, assists partners on matters, and prepares for professional qualification. Country: Singapore. Typical firms: Rajah & Tann (largest SE Asian firm, network includes Vietnam office), Allen & Gledhill, WongPartnership, Drew & Napier. Requirements: LLB from recognized university (NUS, SMU, or overseas with CLP exam), Part B Bar exam. For Vietnamese: requires Singapore-recognized LLB or LLM + passing Part A & B of Singapore Bar.',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 88,
        extraversion: 62,
        agreeableness: 72,
        neuroticism: 35,
        eq_emotional_intelligence: 70,
        adaptability: 82,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 82,
        creativity: 50,
        technical_aptitude: 65,
        communication_written: 85,
        communication_verbal: 75,
        attention_to_detail: 90,
        time_management: 78,
        digital_literacy: 72,
        learning_agility: 88,
        legal_research: 82,
        legal_writing: 85,
        cross_cultural_competence: 78,
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 22,
        impact_vs_money: 35,
        stability_vs_growth: 55,
        collaboration_vs_solo: 68,
        variety_vs_routine: 72,
      },
    },
    avgSalaryVND: '1,400,000,000 - 1,900,000,000', // SGD 55-75K/yr → ~1.4-1.9B VND/yr (annual)
    workHoursPerWeek: 50,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Associate (Singapore Law Firm)',
    vietnameseName: 'Luật sư (Hãng Luật Singapore)',
    description:
      'Qualified associate (1-4 years PQE) at a Singapore law firm. Handles corporate transactions, dispute resolution, banking & finance, or IP matters. Singapore is the leading legal hub in Southeast Asia with strong demand for lawyers with Vietnam expertise. Country: Singapore. Typical firms: Rajah & Tann (provides Vietnam practice via Rajah & Tann LCT), Allen & Gledhill, WongPartnership. Salary: SGD 75,000-150,000/yr. For Vietnamese lawyers: opportunity through Rajah & Tann network or firms seeking ASEAN M&A expertise.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 90,
        extraversion: 62,
        agreeableness: 65,
        neuroticism: 30,
        eq_emotional_intelligence: 75,
        adaptability: 78,
        stress_tolerance: 78,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 55,
        technical_aptitude: 72,
        communication_written: 90,
        communication_verbal: 82,
        attention_to_detail: 90,
        time_management: 82,
        digital_literacy: 75,
        legal_research: 88,
        legal_writing: 88,
        negotiation: 75,
        cross_cultural_competence: 80,
      },
      a3: {
        work_life_balance: 35,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 42,
        impact_vs_money: 30,
        stability_vs_growth: 48,
        collaboration_vs_solo: 65,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '1,900,000,000 - 3,800,000,000', // SGD 75-150K/yr → ~1.9-3.8B VND/yr (annual)
    workHoursPerWeek: 52,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Senior Associate (Singapore Law Firm)',
    vietnameseName: 'Luật sư Cao cấp (Hãng Luật Singapore)',
    description:
      'Senior associate (5-8 years PQE) at a Singapore law firm leading complex transactions and managing junior teams. Often handles cross-border ASEAN deals including Vietnam-focused work. Country: Singapore. Salary: SGD 150,000-250,000/yr. Firms: Rajah & Tann, Allen & Gledhill, WongPartnership, plus international firms\' Singapore offices (Clifford Chance, Allen & Overy, Baker McKenzie). Opportunity to develop Vietnam practice book and potentially become partner.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 90,
        extraversion: 68,
        agreeableness: 62,
        neuroticism: 25,
        eq_emotional_intelligence: 82,
        adaptability: 78,
        stress_tolerance: 82,
        leadership: 78,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 60,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 85,
        attention_to_detail: 90,
        time_management: 85,
        digital_literacy: 78,
        legal_research: 88,
        legal_writing: 90,
        negotiation: 85,
        client_relationship: 80,
        cross_cultural_competence: 85,
        business_development: 72,
      },
      a3: {
        work_life_balance: 28,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 65,
        impact_vs_money: 28,
        stability_vs_growth: 42,
        collaboration_vs_solo: 65,
        variety_vs_routine: 58,
      },
    },
    avgSalaryVND: '3,800,000,000 - 6,300,000,000', // SGD 150-250K/yr → ~3.8-6.3B VND/yr (annual)
    workHoursPerWeek: 55,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'Partner (Singapore Law Firm)',
    vietnameseName: 'Đối tác / Luật sư Thành viên (Hãng Luật Singapore)',
    description:
      'Equity partner at a major Singapore law firm. Leads practice groups, manages significant client portfolios, and contributes to firm strategy. Singapore partners with Vietnam expertise are highly valued for ASEAN cross-border work. Country: Singapore. Firms: Rajah & Tann (largest SE Asian network), Allen & Gledhill, WongPartnership, Drew & Napier. Compensation: SGD 400,000-$1M+/yr depending on practice and book of business. Partnership track: 8-12 years PQE typically.',
    requirements: {
      a1: {
        openness: 72,
        conscientiousness: 92,
        extraversion: 78,
        agreeableness: 58,
        neuroticism: 20,
        eq_emotional_intelligence: 88,
        adaptability: 75,
        stress_tolerance: 88,
        leadership: 90,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 62,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 92,
        attention_to_detail: 88,
        time_management: 90,
        digital_literacy: 72,
        negotiation: 92,
        client_relationship: 95,
        business_development: 92,
        strategic_thinking: 92,
        cross_cultural_competence: 88,
      },
      a3: {
        work_life_balance: 22,
        creativity_vs_structure: 42,
        autonomy_vs_guidance: 88,
        impact_vs_money: 25,
        stability_vs_growth: 38,
        collaboration_vs_solo: 68,
        variety_vs_routine: 58,
      },
    },
    avgSalaryVND: '10,000,000,000 - 25,000,000,000+', // SGD 400K-1M+/yr → ~10-25B+ VND/yr (annual)
    workHoursPerWeek: 52,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  {
    name: 'International Arbitration Counsel (Singapore/Hong Kong)',
    vietnameseName: 'Luật sư Trọng tài Quốc tế (Singapore/Hồng Kông)',
    description:
      'Specialist in international commercial arbitration based in Singapore (SIAC) or Hong Kong (HKIAC). Represents clients in cross-border disputes, investor-state arbitration, and construction disputes. Growing demand for Vietnam-related arbitration as FDI increases. Country: Singapore/Hong Kong. Typical employers: International arbitration practices at Freshfields, Herbert Smith Freehills, White & Case, Three Crowns; or boutique arbitration firms. Also: VIAC (Vietnam International Arbitration Centre) cases increasing. Requirements: Dual qualification advantageous (Vietnam + common law jurisdiction). Salary: SGD 200,000-400,000+/yr.',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 92,
        extraversion: 70,
        agreeableness: 55,
        neuroticism: 22,
        eq_emotional_intelligence: 82,
        adaptability: 78,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 95,
        creativity: 65,
        technical_aptitude: 68,
        communication_written: 95,
        communication_verbal: 92,
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 72,
        legal_research: 92,
        legal_writing: 95,
        negotiation: 88,
        persuasion: 90,
        cross_cultural_competence: 88,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 72,
        impact_vs_money: 35,
        stability_vs_growth: 42,
        collaboration_vs_solo: 55,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '5,000,000,000 - 10,000,000,000', // SGD 200-400K/yr → ~5-10B VND/yr (annual)
    workHoursPerWeek: 52,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  // ==========================================
  // TRACK 7: SPECIALIZED / CROSS-BORDER (9 careers)
  // Covers: IP, Tax, Legal Tech, Paralegal, Academic
  // ==========================================

  {
    name: 'Intellectual Property (IP) Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Sở hữu Trí tuệ (Việt Nam)',
    description:
      'Specializes in trademark registration, patent prosecution, copyright protection, and IP enforcement in Vietnam. Advises both domestic and international clients on IP portfolio management. Growing demand as Vietnam strengthens IP protection under CPTPP and EVFTA commitments. Country: Vietnam. Firms: Baker McKenzie (strong IP practice), Hogan Lovells, VILAF, Pham & Associates (IP boutique), Tilleke & Gibbins. Also: NOIP (National Office of Intellectual Property) filings.',
    requirements: {
      a1: {
        openness: 68,
        conscientiousness: 90,
        extraversion: 52,
        agreeableness: 62,
        neuroticism: 30,
        eq_emotional_intelligence: 68,
        adaptability: 72,
        stress_tolerance: 68,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 55,
        technical_aptitude: 78, // Understanding technology/innovation
        communication_written: 88,
        communication_verbal: 72,
        attention_to_detail: 95,
        time_management: 80,
        digital_literacy: 78,
        legal_research: 88,
        legal_writing: 88,
        regulatory_knowledge: 82,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 55,
        impact_vs_money: 42,
        stability_vs_growth: 55,
        collaboration_vs_solo: 50,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '20,000,000 - 55,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Tax Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Thuế (Việt Nam)',
    description:
      'Advises on Vietnam tax law including corporate income tax, VAT, personal income tax, and transfer pricing. Assists with tax structuring, tax disputes, and compliance. Works closely with Big 4 accounting firms and corporate clients. Country: Vietnam. Firms: Baker McKenzie (tax practice), Big 4 tax practices (PwC, Deloitte, EY, KPMG Vietnam), VILAF. Growing demand: Global Minimum Tax implementation, transfer pricing audits increasing.',
    requirements: {
      a1: {
        openness: 55,
        conscientiousness: 95,
        extraversion: 50,
        agreeableness: 62,
        neuroticism: 28,
        eq_emotional_intelligence: 65,
        adaptability: 68,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 92,
        creativity: 55,
        technical_aptitude: 72,
        communication_written: 85,
        communication_verbal: 72,
        attention_to_detail: 95,
        time_management: 82,
        digital_literacy: 72,
        legal_research: 85,
        legal_writing: 82,
        quantitative_analysis: 85,
        regulatory_knowledge: 92,
        financial_modeling: 65,
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 25,
        autonomy_vs_guidance: 52,
        impact_vs_money: 35,
        stability_vs_growth: 55,
        collaboration_vs_solo: 55,
        variety_vs_routine: 45,
      },
    },
    avgSalaryVND: '22,000,000 - 65,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'high',
    growthPotential: 'high',
  },

  {
    name: 'Employment & Labor Lawyer (Vietnam)',
    vietnameseName: 'Luật sư Lao động (Việt Nam)',
    description:
      'Advises employers and employees on Vietnam\'s Labor Code, social insurance, trade unions, and workplace regulations. Handles employment contracts, termination disputes, workplace investigations, and collective bargaining. Increasing demand from MNCs navigating Vietnam labor law. Country: Vietnam. Firms: Baker McKenzie, Freshfields, Rajah & Tann LCT, VILAF. Key law: Vietnam Labor Code 2019 (effective 2021). Common clients: MNCs (Samsung, Intel, Nike factories), Japanese/Korean manufacturers.',
    requirements: {
      a1: {
        openness: 62,
        conscientiousness: 88,
        extraversion: 65,
        agreeableness: 68,
        neuroticism: 30,
        eq_emotional_intelligence: 82,
        adaptability: 72,
        stress_tolerance: 72,
      },
      a2: {
        analytical_thinking: 82,
        creativity: 50,
        technical_aptitude: 62,
        communication_written: 85,
        communication_verbal: 82,
        attention_to_detail: 88,
        time_management: 78,
        digital_literacy: 68,
        legal_research: 85,
        legal_writing: 85,
        negotiation: 82,
        cross_cultural_competence: 75,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 55,
        impact_vs_money: 50,
        stability_vs_growth: 55,
        collaboration_vs_solo: 65,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '20,000,000 - 55,000,000',
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Legal Technology Specialist',
    vietnameseName: 'Chuyên viên Công nghệ Pháp lý (Legal Tech)',
    description:
      'Bridges law and technology by implementing legal tech solutions (contract management, e-discovery, AI-assisted legal research, document automation). Works in law firms, legal departments, or legal tech startups. Country: Vietnam / International. Employers: Legal tech companies (LegalForce, Luminance), Big Law innovation teams, corporate legal operations teams. Growing field globally with Vietnam emerging as a legal tech hub for SE Asia.',
    requirements: {
      a1: {
        openness: 85,
        conscientiousness: 82,
        extraversion: 58,
        agreeableness: 68,
        neuroticism: 32,
        eq_emotional_intelligence: 68,
        adaptability: 90,
        stress_tolerance: 68,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 75,
        technical_aptitude: 92, // Core skill
        communication_written: 78,
        communication_verbal: 72,
        attention_to_detail: 82,
        time_management: 78,
        digital_literacy: 95,
        learning_agility: 90,
        legal_research: 72,
        legal_writing: 68,
      },
      a3: {
        work_life_balance: 58,
        creativity_vs_structure: 65,
        autonomy_vs_guidance: 65,
        impact_vs_money: 50,
        stability_vs_growth: 55,
        collaboration_vs_solo: 55,
        variety_vs_routine: 78,
      },
    },
    avgSalaryVND: '18,000,000 - 45,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Paralegal / Legal Assistant (Vietnam)',
    vietnameseName: 'Trợ lý Pháp lý (Việt Nam)',
    description:
      'Supports lawyers with legal research, document preparation, case file management, and administrative tasks. Does not require a full law degree in many firms (diploma or bachelor\'s in law or related field). Good entry point for those exploring a legal career. Country: Vietnam. Employers: All law firms (domestic and international), corporate legal departments, government agencies. Requirements: Law diploma or bachelor\'s, strong organizational skills.',
    requirements: {
      a1: {
        openness: 55,
        conscientiousness: 85,
        extraversion: 50,
        agreeableness: 75,
        neuroticism: 38,
        eq_emotional_intelligence: 62,
        adaptability: 70,
        stress_tolerance: 62,
      },
      a2: {
        analytical_thinking: 65,
        creativity: 35,
        technical_aptitude: 60,
        communication_written: 72,
        communication_verbal: 62,
        attention_to_detail: 90,
        time_management: 78,
        digital_literacy: 72,
        learning_agility: 78,
        legal_research: 68,
        legal_writing: 65,
      },
      a3: {
        work_life_balance: 68,
        creativity_vs_structure: 20,
        autonomy_vs_guidance: 25,
        impact_vs_money: 50,
        stability_vs_growth: 65,
        collaboration_vs_solo: 65,
        variety_vs_routine: 42,
      },
    },
    avgSalaryVND: '7,000,000 - 15,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'high',
  },

  {
    name: 'Law Lecturer / Legal Academic (Vietnam)',
    vietnameseName: 'Giảng viên Luật (Việt Nam)',
    description:
      'Teaches law courses at Vietnamese universities and conducts legal research. May also serve as legal consultant. Country: Vietnam. Employers: Hanoi Law University, Ho Chi Minh City University of Law, VNU School of Law, RMIT Vietnam, Ton Duc Thang University. Requirements: Master\'s degree minimum (PhD preferred for senior positions), often LLM from overseas university. Many academics also practice law part-time.',
    requirements: {
      a1: {
        openness: 85,
        conscientiousness: 82,
        extraversion: 68,
        agreeableness: 75,
        neuroticism: 35,
        eq_emotional_intelligence: 75,
        adaptability: 68,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 70,
        technical_aptitude: 62,
        communication_written: 90,
        communication_verbal: 88,
        attention_to_detail: 82,
        time_management: 75,
        digital_literacy: 70,
        legal_research: 92,
        legal_writing: 92,
        teaching_ability: 88,
      },
      a3: {
        work_life_balance: 68,
        creativity_vs_structure: 55,
        autonomy_vs_guidance: 72,
        impact_vs_money: 75,
        stability_vs_growth: 68,
        collaboration_vs_solo: 50,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '10,000,000 - 25,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'medium',
  },

  {
    name: 'Legal Consultant (International Development - Vietnam)',
    vietnameseName: 'Tư vấn Pháp luật (Phát triển Quốc tế - Việt Nam)',
    description:
      'Provides legal advisory services for international development organizations operating in Vietnam. Works on rule of law programs, legal reform projects, anti-corruption initiatives, and access to justice programs. Country: Vietnam. Employers: World Bank, UNDP, USAID, ADB, JICA, EU Delegation to Vietnam, GIZ. Requirements: Vietnamese LLB + LLM (international), 5+ years legal experience, English fluency. Often project-based contracts (6-24 months).',
    requirements: {
      a1: {
        openness: 80,
        conscientiousness: 82,
        extraversion: 65,
        agreeableness: 72,
        neuroticism: 30,
        eq_emotional_intelligence: 80,
        adaptability: 82,
        stress_tolerance: 68,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 65,
        technical_aptitude: 62,
        communication_written: 88,
        communication_verbal: 85,
        attention_to_detail: 80,
        time_management: 80,
        digital_literacy: 72,
        legal_research: 88,
        legal_writing: 88,
        cross_cultural_competence: 88,
        language_skills: 85,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 52,
        autonomy_vs_guidance: 68,
        impact_vs_money: 80,
        stability_vs_growth: 45,
        collaboration_vs_solo: 68,
        variety_vs_routine: 72,
      },
    },
    avgSalaryVND: '35,000,000 - 80,000,000',
    workHoursPerWeek: 42,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'In-House Counsel (US Tech Company)',
    vietnameseName: 'Luật sư Nội bộ (Công ty Công nghệ Mỹ)',
    description:
      'In-house lawyer at a major US technology company (Google, Meta, Amazon, Apple, Microsoft, or high-growth startups). Handles product counseling, privacy law, employment matters, IP, commercial contracts, and regulatory compliance. Better work-life balance than Big Law with competitive compensation including RSUs. Country: United States. Employers: FAANG companies, tech unicorns (Stripe, Databricks, etc.). Compensation: $180,000-$400,000+ total (base + RSU + bonus). Requirements: JD + state Bar + 3-5 years practice experience. For Vietnamese lawyers: requires US qualification, often ex-Big Law.',
    requirements: {
      a1: {
        openness: 78,
        conscientiousness: 85,
        extraversion: 65,
        agreeableness: 70,
        neuroticism: 28,
        eq_emotional_intelligence: 80,
        adaptability: 82,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 88,
        creativity: 68,
        technical_aptitude: 82, // Must understand tech products
        communication_written: 88,
        communication_verbal: 85,
        attention_to_detail: 85,
        time_management: 85,
        digital_literacy: 88,
        legal_research: 82,
        legal_writing: 85,
        business_acumen: 82,
        negotiation: 82,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 55,
        autonomy_vs_guidance: 68,
        impact_vs_money: 35,
        stability_vs_growth: 50,
        collaboration_vs_solo: 72,
        variety_vs_routine: 72,
      },
    },
    avgSalaryVND: '4,500,000,000 - 10,000,000,000', // $180-400K/yr total comp → ~4.5-10B VND/yr (annual)
    workHoursPerWeek: 45,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Hong Kong Solicitor (International Firm)',
    vietnameseName: 'Luật sư (Hãng Luật Quốc tế - Hồng Kông)',
    description:
      'Qualified solicitor at an international law firm\'s Hong Kong office. Hong Kong is a major regional hub for Asia-Pacific M&A, capital markets, and arbitration. Many Vietnam-focused deals are managed from Hong Kong. Country: Hong Kong SAR. Typical firms: Freshfields, Clifford Chance, Linklaters, Allen & Overy, Herbert Smith Freehills, Davis Polk. Salary: HKD 700,000-1,500,000/yr (associate level). For Vietnamese lawyers: possible via LLM pathway + PCLL (Postgraduate Certificate in Laws) or through firm transfer programs.',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 90,
        extraversion: 65,
        agreeableness: 62,
        neuroticism: 28,
        eq_emotional_intelligence: 78,
        adaptability: 80,
        stress_tolerance: 82,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 58,
        technical_aptitude: 72,
        communication_written: 92,
        communication_verbal: 85,
        attention_to_detail: 92,
        time_management: 85,
        digital_literacy: 75,
        legal_research: 88,
        legal_writing: 90,
        negotiation: 82,
        cross_cultural_competence: 85,
        language_skills: 82,
      },
      a3: {
        work_life_balance: 25,
        creativity_vs_structure: 32,
        autonomy_vs_guidance: 55,
        impact_vs_money: 28,
        stability_vs_growth: 42,
        collaboration_vs_solo: 65,
        variety_vs_routine: 58,
      },
    },
    avgSalaryVND: '2,300,000,000 - 4,800,000,000', // HKD 700K-1.5M/yr → ~2.3-4.8B VND/yr (annual)
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },
];

/**
 * Seed function to populate law & legal careers
 */
async function seedLawCareers() {
  console.log('⚖️ Starting law & legal careers seed...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const career of lawCareers) {
    try {
      // Check if career already exists
      const existing = await prisma.career.findUnique({
        where: { name: career.name },
      });

      if (existing) {
        // Update existing career
        await prisma.career.update({
          where: { name: career.name },
          data: career,
        });
        updated++;
        console.log(`✅ Updated: ${career.name}`);
      } else {
        // Create new career
        await prisma.career.create({
          data: career,
        });
        created++;
        console.log(`✨ Created: ${career.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing ${career.name}:`, error.message);
      skipped++;
    }
  }

  console.log('\n⚖️ Law & Legal Careers Seed Summary:');
  console.log(`   ✨ Created: ${created}`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Skipped: ${skipped}`);
  console.log(`   📦 Total: ${lawCareers.length}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    await seedLawCareers();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Seed completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seedLawCareers, lawCareers };
