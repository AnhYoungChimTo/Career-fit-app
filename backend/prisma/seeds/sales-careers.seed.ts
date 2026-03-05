import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Sales Careers Seed Data
 * 20 comprehensive sales career profiles based on Vietnamese job market data
 * Reference: jobs.neu.edu.vn/jobs?categoryJob=21 (Sales category)
 *
 * CAREER PROGRESSION PATHS:
 *
 * General Sales Track:
 * Intern → Sales Admin/Coordinator → Sales Executive → Senior Sales → Sales Manager → Sales Director
 *
 * B2B/Enterprise Track:
 * B2B Intern → B2B Executive → Account Manager → Key Account Manager → Corporate Sales Manager
 *
 * Specialized Tracks:
 * - Digital/Social Commerce: Livestream Sales → Social Commerce Specialist → E-commerce Sales Manager
 * - Software/Tech Sales: Sales Intern (Tech) → Software Sales → Enterprise Sales
 * - Education Sales: Education Consultant → Senior Education Sales
 */

const salesCareers = [
  // ==========================================
  // INTERNSHIP LEVEL (0-1 years)
  // ==========================================

  {
    name: 'Sales Intern',
    vietnameseName: 'Thực tập sinh Kinh doanh',
    description: 'Entry-level internship learning the fundamentals of sales. Assists the sales team with prospecting, customer communication, order processing, and CRM data entry. Ideal for students looking to enter the business development field.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 65,
        extraversion: 75, // Sales requires outgoing personality
        agreeableness: 80, // Building rapport with customers
        neuroticism: 40, // Rejection tolerance
        eq_emotional_intelligence: 70,
        adaptability: 80,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 45,
        creativity: 55,
        technical_aptitude: 50,
        communication_written: 65,
        communication_verbal: 80, // Core sales skill
        attention_to_detail: 60,
        time_management: 65,
        digital_literacy: 65,
        learning_agility: 85,
        willingness_to_learn: 95,
      },
      a3: {
        work_life_balance: 65,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 25, // Needs mentoring
        impact_vs_money: 55, // Motivated by commission potential
        stability_vs_growth: 70,
        collaboration_vs_solo: 70,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '1,500,000 - 4,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Admin Intern',
    vietnameseName: 'Thực tập sinh Sales Admin',
    description: 'Internship supporting the sales administration team with order tracking, document preparation, customer data management, and reporting. Develops skills in both sales processes and administrative coordination.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 80, // Admin requires precision
        extraversion: 60,
        agreeableness: 75,
        neuroticism: 40,
        eq_emotional_intelligence: 65,
        adaptability: 75,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 60,
        creativity: 45,
        technical_aptitude: 65,
        communication_written: 70,
        communication_verbal: 65,
        attention_to_detail: 85, // Critical for admin
        time_management: 75,
        digital_literacy: 75,
        learning_agility: 80,
        willingness_to_learn: 90,
      },
      a3: {
        work_life_balance: 80,
        creativity_vs_structure: 35, // Structure preferred
        autonomy_vs_guidance: 25,
        impact_vs_money: 45,
        stability_vs_growth: 75,
        collaboration_vs_solo: 65,
        variety_vs_routine: 50,
      },
    },
    avgSalaryVND: '2,000,000 - 5,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'high',
  },

  {
    name: 'B2B Sales Intern',
    vietnameseName: 'Thực tập sinh B2B Sales',
    description: 'Internship focused on business-to-business sales. Learns enterprise prospecting, lead qualification, cold calling, proposal preparation, and CRM management. Excellent stepping stone into corporate sales.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 70,
        extraversion: 80, // B2B requires high outreach
        agreeableness: 75,
        neuroticism: 35, // High rejection tolerance needed
        eq_emotional_intelligence: 75,
        adaptability: 80,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 60,
        creativity: 55,
        technical_aptitude: 55,
        communication_written: 70,
        communication_verbal: 85, // B2B pitching is verbal
        attention_to_detail: 65,
        time_management: 70,
        digital_literacy: 70,
        learning_agility: 85,
        willingness_to_learn: 95,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 30,
        impact_vs_money: 60, // Motivated by deals
        stability_vs_growth: 65,
        collaboration_vs_solo: 65,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '2,000,000 - 5,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Operations Intern',
    vietnameseName: 'Thực tập sinh Sales Operations',
    description: 'Internship supporting the sales operations function, focusing on process improvement, pipeline analysis, CRM optimization, and sales reporting. Bridges the gap between sales and data analytics.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 80,
        extraversion: 55,
        agreeableness: 70,
        neuroticism: 40,
        eq_emotional_intelligence: 65,
        adaptability: 80,
        stress_tolerance: 60,
      },
      a2: {
        analytical_thinking: 80, // Data-driven role
        creativity: 55,
        technical_aptitude: 75,
        communication_written: 70,
        communication_verbal: 60,
        attention_to_detail: 85,
        time_management: 75,
        digital_literacy: 85,
        learning_agility: 85,
        willingness_to_learn: 90,
      },
      a3: {
        work_life_balance: 80,
        creativity_vs_structure: 35,
        autonomy_vs_guidance: 30,
        impact_vs_money: 50,
        stability_vs_growth: 70,
        collaboration_vs_solo: 55,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '2,000,000 - 4,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'low',
    growthPotential: 'very_high',
  },

  // ==========================================
  // ENTRY LEVEL (1-3 years)
  // ==========================================

  {
    name: 'Sales Consultant',
    vietnameseName: 'Nhân viên Tư vấn Bán hàng',
    description: 'Front-line sales role responsible for consulting customers, understanding their needs, presenting products/services, and closing deals. Works on both inbound inquiries and outbound prospecting to achieve monthly sales targets.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 70,
        extraversion: 85, // Customer-facing role
        agreeableness: 80,
        neuroticism: 35,
        eq_emotional_intelligence: 80, // Reading customer emotions
        adaptability: 75,
        stress_tolerance: 70,
      },
      a2: {
        analytical_thinking: 55,
        creativity: 60,
        technical_aptitude: 55,
        communication_written: 65,
        communication_verbal: 90, // Core skill
        attention_to_detail: 65,
        time_management: 70,
        digital_literacy: 65,
        learning_agility: 75,
        willingness_to_learn: 80,
      },
      a3: {
        work_life_balance: 55, // Target-driven environment
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 45,
        impact_vs_money: 65, // Commission-driven
        stability_vs_growth: 60,
        collaboration_vs_solo: 55,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '6,000,000 - 12,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Executive',
    vietnameseName: 'Chuyên viên Kinh doanh',
    description: 'Proactively identifies and develops new business opportunities. Manages a portfolio of prospects and clients, delivers product presentations, negotiates contracts, and meets quarterly sales quotas. Requires strong pipeline management skills.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 75,
        extraversion: 85,
        agreeableness: 75,
        neuroticism: 30,
        eq_emotional_intelligence: 80,
        adaptability: 75,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 60,
        creativity: 60,
        technical_aptitude: 55,
        communication_written: 70,
        communication_verbal: 90,
        attention_to_detail: 65,
        time_management: 80, // Pipeline management
        digital_literacy: 70,
        learning_agility: 75,
        willingness_to_learn: 80,
      },
      a3: {
        work_life_balance: 50,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 55,
        impact_vs_money: 70, // Highly motivated by earnings
        stability_vs_growth: 55,
        collaboration_vs_solo: 50,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '8,000,000 - 15,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Admin Coordinator',
    vietnameseName: 'Nhân viên Sales Admin',
    description: 'Supports the sales team with order processing, contract administration, customer service, and sales reporting. Acts as the operational backbone of the sales department, ensuring smooth execution between sales, logistics, and finance.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 60,
        conscientiousness: 85,
        extraversion: 60,
        agreeableness: 80,
        neuroticism: 40,
        eq_emotional_intelligence: 70,
        adaptability: 70,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 65,
        creativity: 45,
        technical_aptitude: 70,
        communication_written: 75,
        communication_verbal: 70,
        attention_to_detail: 90, // Contract accuracy critical
        time_management: 80,
        digital_literacy: 80,
        learning_agility: 70,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 75,
        creativity_vs_structure: 30,
        autonomy_vs_guidance: 40,
        impact_vs_money: 45,
        stability_vs_growth: 70,
        collaboration_vs_solo: 60,
        variety_vs_routine: 45,
      },
    },
    avgSalaryVND: '6,000,000 - 11,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Education Sales Consultant',
    vietnameseName: 'Chuyên viên Tư vấn Tuyển sinh',
    description: 'Consults prospective students and parents on educational programs, courses, and enrollment options. Manages the admissions pipeline from inquiry to enrollment. Common in language centers, tutoring companies, and private universities.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 70,
        extraversion: 80,
        agreeableness: 85, // Empathetic with students/parents
        neuroticism: 40,
        eq_emotional_intelligence: 85,
        adaptability: 70,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 50,
        creativity: 55,
        technical_aptitude: 50,
        communication_written: 65,
        communication_verbal: 90,
        attention_to_detail: 65,
        time_management: 70,
        digital_literacy: 65,
        learning_agility: 75,
        willingness_to_learn: 80,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 45,
        impact_vs_money: 60,
        stability_vs_growth: 65,
        collaboration_vs_solo: 60,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '7,000,000 - 15,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'high',
  },

  {
    name: 'Livestream Sales Specialist',
    vietnameseName: 'Chuyên viên Bán hàng Livestream',
    description: 'Drives product sales through live-streaming platforms (TikTok Shop, Shopee Live, Facebook Live). Engages audiences in real-time, demonstrates products, handles Q&A, and converts viewers into buyers. A fast-growing role in Vietnam\'s social commerce market.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 80,
        conscientiousness: 65,
        extraversion: 95, // Must be highly engaging on camera
        agreeableness: 75,
        neuroticism: 30,
        eq_emotional_intelligence: 75,
        adaptability: 85, // Real-time environment
        stress_tolerance: 70,
      },
      a2: {
        analytical_thinking: 50,
        creativity: 75, // Engaging content creation
        technical_aptitude: 65,
        communication_written: 55,
        communication_verbal: 95, // Non-stop talking
        attention_to_detail: 55,
        time_management: 70,
        digital_literacy: 80,
        learning_agility: 80,
        willingness_to_learn: 85,
      },
      a3: {
        work_life_balance: 55,
        creativity_vs_structure: 65, // Creative format
        autonomy_vs_guidance: 55,
        impact_vs_money: 70,
        stability_vs_growth: 55,
        collaboration_vs_solo: 50,
        variety_vs_routine: 75,
      },
    },
    avgSalaryVND: '6,500,000 - 15,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  // ==========================================
  // MID LEVEL (3-7 years)
  // ==========================================

  {
    name: 'B2B Sales Executive',
    vietnameseName: 'Chuyên viên B2B Kinh doanh',
    description: 'Manages a portfolio of corporate clients and prospects, executing complex enterprise sales cycles from initial outreach to contract negotiation. Develops strategic relationships with decision-makers, delivers tailored solutions presentations, and achieves annual revenue targets.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 80,
        extraversion: 85,
        agreeableness: 70,
        neuroticism: 25,
        eq_emotional_intelligence: 85,
        adaptability: 75,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 70, // Complex deal structuring
        creativity: 65,
        technical_aptitude: 65,
        communication_written: 80, // Proposal writing
        communication_verbal: 90,
        attention_to_detail: 70,
        time_management: 85,
        digital_literacy: 75,
        learning_agility: 75,
        willingness_to_learn: 80,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 65, // Self-directed territory management
        impact_vs_money: 75,
        stability_vs_growth: 50,
        collaboration_vs_solo: 45,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '12,000,000 - 25,000,000',
    workHoursPerWeek: 48,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Business Development Executive',
    vietnameseName: 'Chuyên viên Phát triển Kinh doanh',
    description: 'Identifies and creates new business opportunities through market research, partnership development, and strategic outreach. Bridges product/service capabilities with unmet market needs. Works closely with leadership to drive company growth in new segments or geographies.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 80, // Exploring new markets requires creativity
        conscientiousness: 75,
        extraversion: 80,
        agreeableness: 70,
        neuroticism: 30,
        eq_emotional_intelligence: 80,
        adaptability: 85,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 80,
        creativity: 75, // Market opportunity identification
        technical_aptitude: 60,
        communication_written: 80,
        communication_verbal: 85,
        attention_to_detail: 65,
        time_management: 80,
        digital_literacy: 75,
        learning_agility: 85,
        willingness_to_learn: 85,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 65, // Strategic thinking
        autonomy_vs_guidance: 65,
        impact_vs_money: 65,
        stability_vs_growth: 45, // Growth-oriented role
        collaboration_vs_solo: 50,
        variety_vs_routine: 80,
      },
    },
    avgSalaryVND: '12,000,000 - 20,000,000',
    workHoursPerWeek: 46,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Key Account Manager',
    vietnameseName: 'Quản lý Khách hàng Trọng yếu',
    description: 'Manages and grows relationships with the company\'s most strategic clients. Develops account plans, identifies upsell and cross-sell opportunities, resolves escalations, and ensures high client satisfaction and retention. Represents the voice of the client internally.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 85,
        extraversion: 80,
        agreeableness: 85, // Relationship-first mindset
        neuroticism: 25,
        eq_emotional_intelligence: 90, // Critical for account retention
        adaptability: 75,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 75,
        creativity: 65,
        technical_aptitude: 65,
        communication_written: 80,
        communication_verbal: 90,
        attention_to_detail: 75,
        time_management: 85,
        digital_literacy: 75,
        learning_agility: 75,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 65,
        impact_vs_money: 70,
        stability_vs_growth: 55,
        collaboration_vs_solo: 55,
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '18,000,000 - 35,000,000',
    workHoursPerWeek: 46,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Team Leader',
    vietnameseName: 'Trưởng nhóm Kinh doanh',
    description: 'Leads a team of 4-8 sales representatives, setting targets, coaching performance, and driving team results. Balances personal sales responsibilities with team mentorship. Reviews pipelines, resolves deal escalations, and reports performance to sales management.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 85,
        extraversion: 85,
        agreeableness: 75,
        neuroticism: 25,
        eq_emotional_intelligence: 85,
        adaptability: 75,
        stress_tolerance: 80,
      },
      a2: {
        analytical_thinking: 70,
        creativity: 60,
        technical_aptitude: 60,
        communication_written: 75,
        communication_verbal: 90,
        attention_to_detail: 70,
        time_management: 85,
        digital_literacy: 70,
        learning_agility: 75,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 40,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 70,
        impact_vs_money: 70,
        stability_vs_growth: 55,
        collaboration_vs_solo: 75, // Team-oriented
        variety_vs_routine: 60,
      },
    },
    avgSalaryVND: '15,000,000 - 30,000,000',
    workHoursPerWeek: 50,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Software Sales Executive',
    vietnameseName: 'Chuyên viên Kinh doanh Phần mềm',
    description: 'Sells enterprise software solutions (ERP, CRM, SaaS) to corporate clients. Requires deep understanding of both business processes and technical product capabilities. Manages long sales cycles, multi-stakeholder negotiations, and complex demos.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 80,
        extraversion: 80,
        agreeableness: 70,
        neuroticism: 30,
        eq_emotional_intelligence: 80,
        adaptability: 80,
        stress_tolerance: 75,
      },
      a2: {
        analytical_thinking: 80, // Must understand complex software
        creativity: 65,
        technical_aptitude: 80, // Technical product knowledge essential
        communication_written: 80,
        communication_verbal: 85,
        attention_to_detail: 75,
        time_management: 80,
        digital_literacy: 90,
        learning_agility: 85,
        willingness_to_learn: 90,
      },
      a3: {
        work_life_balance: 45,
        creativity_vs_structure: 50,
        autonomy_vs_guidance: 65,
        impact_vs_money: 70,
        stability_vs_growth: 50,
        collaboration_vs_solo: 50,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '12,000,000 - 30,000,000',
    workHoursPerWeek: 46,
    stressLevel: 'high',
    growthPotential: 'very_high',
  },

  {
    name: 'Sales Operations Analyst',
    vietnameseName: 'Chuyên viên Sales Operations',
    description: 'Optimizes the efficiency of the sales organization through data analysis, process design, CRM management, and sales enablement. Provides actionable insights to sales leadership, designs compensation structures, and implements tools that improve sales productivity.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 90,
        extraversion: 55,
        agreeableness: 70,
        neuroticism: 35,
        eq_emotional_intelligence: 65,
        adaptability: 80,
        stress_tolerance: 70,
      },
      a2: {
        analytical_thinking: 90, // Data-heavy role
        creativity: 65,
        technical_aptitude: 85,
        communication_written: 80,
        communication_verbal: 65,
        attention_to_detail: 90,
        time_management: 85,
        digital_literacy: 90,
        learning_agility: 80,
        willingness_to_learn: 85,
      },
      a3: {
        work_life_balance: 65,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 65,
        impact_vs_money: 55,
        stability_vs_growth: 60,
        collaboration_vs_solo: 55,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '12,000,000 - 22,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },

  // ==========================================
  // SENIOR LEVEL (7-12 years)
  // ==========================================

  {
    name: 'Sales Manager',
    vietnameseName: 'Trưởng phòng Kinh doanh',
    description: 'Leads the entire sales department, managing multiple teams or channels to deliver revenue targets. Owns the sales strategy, territory planning, hiring and developing sales talent, and executive reporting. Partners closely with Marketing and Product teams.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 90,
        extraversion: 80,
        agreeableness: 70,
        neuroticism: 20,
        eq_emotional_intelligence: 90,
        adaptability: 80,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 70,
        technical_aptitude: 65,
        communication_written: 85,
        communication_verbal: 90,
        attention_to_detail: 75,
        time_management: 90,
        digital_literacy: 75,
        learning_agility: 75,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 35,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 80, // Highly autonomous
        impact_vs_money: 70,
        stability_vs_growth: 50,
        collaboration_vs_solo: 80, // Leads a department
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '25,000,000 - 50,000,000',
    workHoursPerWeek: 50,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  {
    name: 'Corporate Sales Manager',
    vietnameseName: 'Trưởng phòng Kinh doanh Doanh nghiệp',
    description: 'Leads B2B and enterprise sales efforts targeting large corporations and government accounts. Manages senior client relationships, oversees complex multi-million dong deal cycles, and develops go-to-market strategies for corporate segments.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 70,
        conscientiousness: 88,
        extraversion: 85,
        agreeableness: 70,
        neuroticism: 20,
        eq_emotional_intelligence: 90,
        adaptability: 80,
        stress_tolerance: 85,
      },
      a2: {
        analytical_thinking: 85,
        creativity: 70,
        technical_aptitude: 70,
        communication_written: 90,
        communication_verbal: 90,
        attention_to_detail: 80,
        time_management: 90,
        digital_literacy: 80,
        learning_agility: 75,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 30,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 80,
        impact_vs_money: 75,
        stability_vs_growth: 50,
        collaboration_vs_solo: 70,
        variety_vs_routine: 65,
      },
    },
    avgSalaryVND: '30,000,000 - 60,000,000',
    workHoursPerWeek: 50,
    stressLevel: 'very_high',
    growthPotential: 'very_high',
  },

  // ==========================================
  // EXECUTIVE LEVEL (12+ years)
  // ==========================================

  {
    name: 'Sales Director',
    vietnameseName: 'Giám đốc Kinh doanh',
    description: 'Serves as the top sales leader, responsible for all revenue-generating activities across the organization. Sets the national or regional sales vision, shapes go-to-market strategies, manages large sales organizations (20+ people), and reports to the CEO or COO.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 90,
        extraversion: 85,
        agreeableness: 65,
        neuroticism: 15,
        eq_emotional_intelligence: 90,
        adaptability: 85,
        stress_tolerance: 90,
      },
      a2: {
        analytical_thinking: 90,
        creativity: 75,
        technical_aptitude: 70,
        communication_written: 90,
        communication_verbal: 95,
        attention_to_detail: 80,
        time_management: 90,
        digital_literacy: 80,
        learning_agility: 80,
        willingness_to_learn: 75,
      },
      a3: {
        work_life_balance: 25,
        creativity_vs_structure: 55,
        autonomy_vs_guidance: 90, // Fully autonomous
        impact_vs_money: 80,
        stability_vs_growth: 40,
        collaboration_vs_solo: 75,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '40,000,000 - 80,000,000',
    workHoursPerWeek: 55,
    stressLevel: 'very_high',
    growthPotential: 'high',
  },

  // ==========================================
  // SPECIALIZED / CROSS-LEVEL
  // ==========================================

  {
    name: 'Junior Sales Trainee',
    vietnameseName: 'Nhân viên Kinh doanh Mới tốt nghiệp',
    description: 'Structured trainee program for fresh graduates entering the sales profession. Rotates through sales departments (inside sales, field sales, key accounts) over 6-12 months with dedicated mentorship and training. Aims to develop a well-rounded sales professional.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 75,
        conscientiousness: 70,
        extraversion: 75,
        agreeableness: 80,
        neuroticism: 40,
        eq_emotional_intelligence: 70,
        adaptability: 85,
        stress_tolerance: 65,
      },
      a2: {
        analytical_thinking: 55,
        creativity: 55,
        technical_aptitude: 55,
        communication_written: 65,
        communication_verbal: 80,
        attention_to_detail: 65,
        time_management: 70,
        digital_literacy: 70,
        learning_agility: 90, // Most critical for trainee
        willingness_to_learn: 95,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 45,
        autonomy_vs_guidance: 25, // Needs structured guidance
        impact_vs_money: 60,
        stability_vs_growth: 70,
        collaboration_vs_solo: 65,
        variety_vs_routine: 70,
      },
    },
    avgSalaryVND: '4,000,000 - 8,000,000',
    workHoursPerWeek: 44,
    stressLevel: 'low',
    growthPotential: 'very_high',
  },

  {
    name: 'Inside Sales Representative',
    vietnameseName: 'Nhân viên Kinh doanh Nội bộ',
    description: 'Conducts all sales activities remotely via phone, email, and video calls without field visits. Manages high-volume outreach, qualifies inbound leads, demos products digitally, and closes deals virtually. Common in SaaS, fintech, and e-learning companies.',
    category: 'sales',
    requirements: {
      a1: {
        openness: 65,
        conscientiousness: 75,
        extraversion: 75,
        agreeableness: 75,
        neuroticism: 35,
        eq_emotional_intelligence: 75,
        adaptability: 75,
        stress_tolerance: 70,
      },
      a2: {
        analytical_thinking: 60,
        creativity: 55,
        technical_aptitude: 70, // CRM and digital tools
        communication_written: 80, // Heavy email usage
        communication_verbal: 85,
        attention_to_detail: 70,
        time_management: 85, // High-volume environment
        digital_literacy: 85,
        learning_agility: 75,
        willingness_to_learn: 80,
      },
      a3: {
        work_life_balance: 60,
        creativity_vs_structure: 40,
        autonomy_vs_guidance: 55,
        impact_vs_money: 65,
        stability_vs_growth: 60,
        collaboration_vs_solo: 55,
        variety_vs_routine: 55,
      },
    },
    avgSalaryVND: '8,000,000 - 18,000,000',
    workHoursPerWeek: 40,
    stressLevel: 'medium',
    growthPotential: 'very_high',
  },
];

/**
 * Seed function to populate sales careers
 */
async function seedSalesCareers() {
  console.log('🌱 Starting sales careers seed...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const career of salesCareers) {
    try {
      const existing = await prisma.career.findUnique({
        where: { name: career.name },
      });

      if (existing) {
        await prisma.career.update({
          where: { name: career.name },
          data: career,
        });
        updated++;
        console.log(`✅ Updated: ${career.name}`);
      } else {
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

  console.log('\n📊 Sales Careers Seed Summary:');
  console.log(`   ✨ Created: ${created}`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Skipped: ${skipped}`);
  console.log(`   📦 Total: ${salesCareers.length}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    await seedSalesCareers();
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

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

export { seedSalesCareers, salesCareers };
