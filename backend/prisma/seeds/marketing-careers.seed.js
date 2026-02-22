"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketingCareers = void 0;
exports.seedMarketingCareers = seedMarketingCareers;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Marketing Careers Seed Data
 * 43 comprehensive marketing career profiles covering In-House, Agency, SME, and Specialized roles
 *
 * CAREER PROGRESSION PATHS:
 *
 * In-House Track (General Marketing):
 * Intern → Coordinator/Specialist → Manager → Senior Manager → Director → VP → CMO
 *
 * In-House Track (Creative/Production):
 * Intern → Designer/Editor/Photographer → Senior Designer/Editor → Creative Lead/Manager
 *
 * Agency Track:
 * Intern → Junior Executive → Account Manager → Senior Account Manager → Account Director
 * Intern → Creative Intern → Junior Copywriter/Designer → Copywriter/Art Director → Senior Copywriter/Art Director → Creative Director
 *
 * SME/Startup Track:
 * Generalist → Marketing Manager → Head of Marketing → VP of Marketing
 *
 * Specialized Track:
 * Entry Specialist → Senior Specialist → Lead/Manager
 */
const marketingCareers = [
    // ==========================================
    // PHASE 1: IN-HOUSE MARKETING ROLES (22)
    // Includes: General Marketing (15) + Creative/Production (7)
    // ==========================================
    // INTERN LEVEL (0-1 years)
    {
        name: 'Marketing Intern',
        vietnameseName: 'Thực tập sinh Marketing',
        description: 'Entry-level internship learning fundamental marketing skills. Assists team with research, content creation, social media, event support, and administrative tasks. Perfect for students or career changers starting in marketing.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75, // Eager to learn
                conscientiousness: 70,
                extraversion: 60,
                agreeableness: 80, // Team player
                neuroticism: 45,
                eq_emotional_intelligence: 60,
                adaptability: 80, // Learning mode
                stress_tolerance: 55,
            },
            a2: {
                analytical_thinking: 50,
                creativity: 65,
                technical_aptitude: 60,
                communication_written: 65,
                communication_verbal: 60,
                attention_to_detail: 70,
                time_management: 60,
                digital_literacy: 70,
                learning_agility: 85, // Critical for intern
                willingness_to_learn: 95,
            },
            a3: {
                work_life_balance: 75, // Structured hours
                creativity_vs_structure: 55,
                autonomy_vs_guidance: 25, // Needs heavy guidance
                impact_vs_money: 45, // Learning focus
                stability_vs_growth: 70, // Growth mindset
                collaboration_vs_solo: 75,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '1,500,000 - 4,000,000',
        workHoursPerWeek: 40,
        stressLevel: 'low',
        growthPotential: 'very_high',
    },
    {
        name: 'Digital Marketing Intern',
        vietnameseName: 'Thực tập sinh Marketing Số',
        description: 'Specialized internship focused on digital marketing channels. Learns SEO, social media, email marketing, analytics, and paid advertising while supporting digital campaigns and creating content.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 70,
                extraversion: 60,
                agreeableness: 75,
                neuroticism: 45,
                eq_emotional_intelligence: 60,
                adaptability: 85,
                stress_tolerance: 60,
            },
            a2: {
                analytical_thinking: 55,
                creativity: 70,
                technical_aptitude: 75, // Digital focus
                communication_written: 70,
                communication_verbal: 60,
                attention_to_detail: 75,
                time_management: 65,
                digital_literacy: 85, // Essential
                learning_agility: 90,
                willingness_to_learn: 95,
            },
            a3: {
                work_life_balance: 75,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 30,
                impact_vs_money: 45,
                stability_vs_growth: 75,
                collaboration_vs_solo: 70,
                variety_vs_routine: 75,
            },
        },
        avgSalaryVND: '2,000,000 - 4,500,000',
        workHoursPerWeek: 40,
        stressLevel: 'low',
        growthPotential: 'very_high',
    },
    {
        name: 'Content Marketing Intern',
        vietnameseName: 'Thực tập sinh Marketing Nội dung',
        description: 'Internship focused on content creation and writing. Assists with blog posts, social media content, newsletters, and copywriting while learning content strategy and SEO basics.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 70,
                extraversion: 55,
                agreeableness: 75,
                neuroticism: 45,
                eq_emotional_intelligence: 65,
                adaptability: 75,
                stress_tolerance: 60,
            },
            a2: {
                analytical_thinking: 50,
                creativity: 85, // Creative focus
                technical_aptitude: 60,
                communication_written: 85, // Essential
                communication_verbal: 60,
                attention_to_detail: 70,
                time_management: 65,
                digital_literacy: 70,
                learning_agility: 85,
                writing_skills: 85,
            },
            a3: {
                work_life_balance: 75,
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 30,
                impact_vs_money: 50,
                stability_vs_growth: 75,
                collaboration_vs_solo: 60,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '1,500,000 - 3,500,000',
        workHoursPerWeek: 40,
        stressLevel: 'low',
        growthPotential: 'very_high',
    },
    // ENTRY LEVEL (1-3 years)
    {
        name: 'Digital Marketing Coordinator',
        vietnameseName: 'Điều phối viên Marketing Số',
        description: 'Entry-level role supporting digital marketing campaigns across multiple channels including social media, email, SEO, and paid advertising. Assists senior marketers with campaign execution, content scheduling, and performance tracking.',
        category: 'marketing',
        requirements: {
            a1: {
                // Personality traits
                openness: 70, // Creative and willing to learn new tools
                conscientiousness: 75, // Organized and detail-oriented
                extraversion: 60, // Comfortable with collaboration
                agreeableness: 70, // Team player
                neuroticism: 40, // Handles fast-paced environment
                eq_emotional_intelligence: 65,
                adaptability: 70,
                stress_tolerance: 60,
            },
            a2: {
                // Skills and talents
                analytical_thinking: 60,
                creativity: 65,
                technical_aptitude: 70, // Must learn marketing tools
                communication_written: 70,
                communication_verbal: 60,
                attention_to_detail: 75,
                time_management: 70,
                digital_literacy: 80,
                learning_agility: 75,
            },
            a3: {
                // Values and preferences
                work_life_balance: 70, // Generally good hours
                creativity_vs_structure: 60, // Mix of both
                autonomy_vs_guidance: 40, // Prefers guidance
                impact_vs_money: 50, // Balanced
                stability_vs_growth: 55, // Focus on learning
                collaboration_vs_solo: 70, // Team-oriented
                variety_vs_routine: 65, // Varied tasks
            },
        },
        avgSalaryVND: '8,000,000 - 12,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'high',
    },
    {
        name: 'Marketing Analyst',
        vietnameseName: 'Chuyên viên Phân tích Marketing',
        description: 'Data-focused role analyzing marketing campaign performance, customer behavior, and market trends. Creates reports, dashboards, and actionable insights to optimize marketing ROI and strategy.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 65,
                conscientiousness: 85, // Highly detail-oriented
                extraversion: 45, // Can work independently
                agreeableness: 65,
                neuroticism: 35,
                eq_emotional_intelligence: 60,
                adaptability: 65,
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 90, // Core competency
                creativity: 50,
                technical_aptitude: 85, // Excel, SQL, analytics tools
                communication_written: 75, // Reports and presentations
                communication_verbal: 65,
                attention_to_detail: 90,
                time_management: 70,
                digital_literacy: 85,
                learning_agility: 75,
                problem_solving: 80,
                data_interpretation: 90,
            },
            a3: {
                work_life_balance: 65,
                creativity_vs_structure: 35, // Prefers structure
                autonomy_vs_guidance: 50,
                impact_vs_money: 55,
                stability_vs_growth: 50,
                collaboration_vs_solo: 45, // Can work independently
                variety_vs_routine: 50,
            },
        },
        avgSalaryVND: '10,000,000 - 15,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    {
        name: 'Content Marketing Specialist',
        vietnameseName: 'Chuyên viên Marketing Nội dung',
        description: 'Creates engaging written content including blog posts, articles, social media posts, and marketing copy. Develops content strategies to attract and engage target audiences while supporting SEO goals.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85, // Creative and curious
                conscientiousness: 70,
                extraversion: 55,
                agreeableness: 70,
                neuroticism: 45,
                eq_emotional_intelligence: 70, // Understands audience
                adaptability: 75,
                stress_tolerance: 65,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 90, // Core competency
                technical_aptitude: 65,
                communication_written: 95, // Essential skill
                communication_verbal: 65,
                attention_to_detail: 75,
                time_management: 70,
                digital_literacy: 75,
                learning_agility: 70,
                storytelling: 90,
            },
            a3: {
                work_life_balance: 70,
                creativity_vs_structure: 75, // High creativity
                autonomy_vs_guidance: 60, // Some autonomy
                impact_vs_money: 60, // Values creative impact
                stability_vs_growth: 55,
                collaboration_vs_solo: 50, // Mix of both
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '8,000,000 - 14,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'high',
    },
    {
        name: 'Digital Marketing Manager',
        vietnameseName: 'Quản lý Marketing Số',
        description: 'Manages digital marketing strategy and execution across all online channels. Leads campaigns, manages budgets, analyzes performance, and drives customer acquisition and engagement through digital platforms.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 80,
                extraversion: 70, // Leadership required
                agreeableness: 65,
                neuroticism: 35,
                eq_emotional_intelligence: 75,
                adaptability: 80,
                stress_tolerance: 75,
                leadership: 70,
            },
            a2: {
                analytical_thinking: 80,
                creativity: 75,
                technical_aptitude: 80,
                communication_written: 75,
                communication_verbal: 80,
                attention_to_detail: 75,
                time_management: 80,
                digital_literacy: 90,
                learning_agility: 80,
                strategic_thinking: 80,
                budget_management: 75,
                team_management: 70,
            },
            a3: {
                work_life_balance: 55, // Demanding role
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 70, // High autonomy
                impact_vs_money: 60,
                stability_vs_growth: 60,
                collaboration_vs_solo: 70,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '20,000,000 - 35,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Brand Manager',
        vietnameseName: 'Quản lý Thương hiệu',
        description: 'Owns brand strategy, positioning, and identity for a product or company. Develops brand campaigns, manages brand guidelines, conducts market research, and ensures consistent brand messaging across all touchpoints.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 80,
                extraversion: 70,
                agreeableness: 65,
                neuroticism: 35,
                eq_emotional_intelligence: 80, // Understands consumer psychology
                adaptability: 70,
                stress_tolerance: 75,
                leadership: 75,
            },
            a2: {
                analytical_thinking: 75,
                creativity: 85, // Strong creative vision
                technical_aptitude: 65,
                communication_written: 80,
                communication_verbal: 85,
                attention_to_detail: 80,
                time_management: 75,
                digital_literacy: 75,
                strategic_thinking: 85,
                brand_thinking: 90,
                consumer_insights: 85,
            },
            a3: {
                work_life_balance: 55,
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 75,
                impact_vs_money: 65, // Values brand impact
                stability_vs_growth: 55,
                collaboration_vs_solo: 65,
                variety_vs_routine: 65,
            },
        },
        avgSalaryVND: '25,000,000 - 40,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Product Marketing Manager',
        vietnameseName: 'Quản lý Marketing Sản phẩm',
        description: 'Bridges product development and marketing by positioning products in the market. Develops go-to-market strategies, creates product messaging, conducts competitive analysis, and enables sales teams with product knowledge.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 85,
                extraversion: 70,
                agreeableness: 70,
                neuroticism: 30,
                eq_emotional_intelligence: 75,
                adaptability: 80,
                stress_tolerance: 80,
                leadership: 75,
            },
            a2: {
                analytical_thinking: 85,
                creativity: 70,
                technical_aptitude: 75, // Must understand products
                communication_written: 85,
                communication_verbal: 85,
                attention_to_detail: 80,
                time_management: 80,
                digital_literacy: 80,
                strategic_thinking: 90,
                product_knowledge: 85,
                market_research: 80,
            },
            a3: {
                work_life_balance: 50,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 70,
                impact_vs_money: 65,
                stability_vs_growth: 60,
                collaboration_vs_solo: 75, // Cross-functional
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '25,000,000 - 42,000,000',
        workHoursPerWeek: 52,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Social Media Manager',
        vietnameseName: 'Quản lý Truyền thông Xã hội',
        description: 'Develops and executes social media strategy across platforms (Facebook, Instagram, TikTok, LinkedIn, etc.). Creates content calendars, manages community engagement, analyzes performance, and builds brand presence on social channels.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 70,
                extraversion: 80, // Engaging personality
                agreeableness: 75,
                neuroticism: 40,
                eq_emotional_intelligence: 85, // Community management
                adaptability: 90, // Fast-changing platforms
                stress_tolerance: 70,
                leadership: 65,
            },
            a2: {
                analytical_thinking: 70,
                creativity: 90,
                technical_aptitude: 75,
                communication_written: 85,
                communication_verbal: 80,
                attention_to_detail: 70,
                time_management: 75,
                digital_literacy: 95, // Must stay current
                learning_agility: 90,
                trend_awareness: 95,
                visual_aesthetic: 80,
            },
            a3: {
                work_life_balance: 55, // Always-on nature
                creativity_vs_structure: 75,
                autonomy_vs_guidance: 65,
                impact_vs_money: 60,
                stability_vs_growth: 60,
                collaboration_vs_solo: 65,
                variety_vs_routine: 85, // Highly varied
            },
        },
        avgSalaryVND: '18,000,000 - 30,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Performance Marketing Manager',
        vietnameseName: 'Quản lý Marketing Hiệu suất',
        description: 'Focuses on measurable ROI through paid advertising channels (Google Ads, Facebook Ads, etc.). Manages ad budgets, optimizes campaigns for conversions, conducts A/B testing, and drives customer acquisition at scale.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 70,
                conscientiousness: 85,
                extraversion: 55,
                agreeableness: 60,
                neuroticism: 30,
                eq_emotional_intelligence: 65,
                adaptability: 75,
                stress_tolerance: 85, // High-pressure ROI focus
                leadership: 70,
            },
            a2: {
                analytical_thinking: 95, // Core skill
                creativity: 65,
                technical_aptitude: 85,
                communication_written: 70,
                communication_verbal: 75,
                attention_to_detail: 90,
                time_management: 80,
                digital_literacy: 90,
                data_interpretation: 95,
                optimization_mindset: 95,
                budget_management: 85,
            },
            a3: {
                work_life_balance: 50,
                creativity_vs_structure: 40, // Data-driven
                autonomy_vs_guidance: 70,
                impact_vs_money: 50, // ROI-focused
                stability_vs_growth: 60,
                collaboration_vs_solo: 55,
                variety_vs_routine: 60,
            },
        },
        avgSalaryVND: '22,000,000 - 38,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    {
        name: 'Senior Marketing Manager',
        vietnameseName: 'Quản lý Marketing Cấp cao',
        description: 'Leads multiple marketing functions or major strategic initiatives. Manages teams, oversees large budgets, develops comprehensive marketing strategies, and reports to marketing director or VP level.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 85,
                extraversion: 75,
                agreeableness: 70,
                neuroticism: 30,
                eq_emotional_intelligence: 85,
                adaptability: 80,
                stress_tolerance: 85,
                leadership: 85,
            },
            a2: {
                analytical_thinking: 85,
                creativity: 75,
                technical_aptitude: 75,
                communication_written: 85,
                communication_verbal: 90,
                attention_to_detail: 75,
                time_management: 85,
                digital_literacy: 80,
                strategic_thinking: 90,
                team_management: 85,
                budget_management: 85,
                stakeholder_management: 85,
            },
            a3: {
                work_life_balance: 45,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 80,
                impact_vs_money: 65,
                stability_vs_growth: 60,
                collaboration_vs_solo: 75,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '30,000,000 - 50,000,000',
        workHoursPerWeek: 55,
        stressLevel: 'very_high',
        growthPotential: 'high',
    },
    {
        name: 'Marketing Director',
        vietnameseName: 'Giám đốc Marketing',
        description: 'Oversees entire marketing department or major division. Sets strategic direction, manages leadership team, owns P&L responsibility, and drives company growth through comprehensive marketing strategy.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 85,
                extraversion: 80,
                agreeableness: 65,
                neuroticism: 25,
                eq_emotional_intelligence: 90,
                adaptability: 80,
                stress_tolerance: 90,
                leadership: 90,
                strategic_vision: 90,
            },
            a2: {
                analytical_thinking: 85,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 85,
                communication_verbal: 95,
                attention_to_detail: 70,
                time_management: 85,
                digital_literacy: 75,
                strategic_thinking: 95,
                team_management: 90,
                budget_management: 90,
                stakeholder_management: 90,
                business_acumen: 90,
            },
            a3: {
                work_life_balance: 35,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 90,
                impact_vs_money: 70,
                stability_vs_growth: 65,
                collaboration_vs_solo: 75,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '30,000,000 - 55,000,000',
        workHoursPerWeek: 60,
        stressLevel: 'very_high',
        growthPotential: 'moderate',
    },
    {
        name: 'VP of Marketing',
        vietnameseName: 'Phó Chủ tịch Marketing',
        description: 'Senior executive overseeing all marketing functions company-wide. Reports to CMO or CEO, drives revenue growth, builds marketing organization, sets long-term strategy, and represents marketing at C-level.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 90,
                extraversion: 85,
                agreeableness: 65,
                neuroticism: 20,
                eq_emotional_intelligence: 95,
                adaptability: 80,
                stress_tolerance: 95,
                leadership: 95,
                strategic_vision: 95,
            },
            a2: {
                analytical_thinking: 90,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 90,
                communication_verbal: 95,
                attention_to_detail: 70,
                time_management: 90,
                strategic_thinking: 95,
                team_management: 95,
                budget_management: 95,
                stakeholder_management: 95,
                business_acumen: 95,
                executive_presence: 95,
            },
            a3: {
                work_life_balance: 25,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 95,
                impact_vs_money: 75,
                stability_vs_growth: 70,
                collaboration_vs_solo: 80,
                variety_vs_routine: 75,
            },
        },
        avgSalaryVND: '35,000,000 - 65,000,000',
        workHoursPerWeek: 60,
        stressLevel: 'very_high',
        growthPotential: 'moderate',
    },
    {
        name: 'Chief Marketing Officer (CMO)',
        vietnameseName: 'Giám đốc Marketing (CMO)',
        description: 'Top marketing executive responsible for all marketing strategy and execution. C-suite member driving company vision, brand strategy, revenue growth, and market positioning. Leads entire marketing organization.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 90,
                extraversion: 85,
                agreeableness: 65,
                neuroticism: 20,
                eq_emotional_intelligence: 95,
                adaptability: 85,
                stress_tolerance: 95,
                leadership: 98,
                strategic_vision: 98,
            },
            a2: {
                analytical_thinking: 90,
                creativity: 80,
                technical_aptitude: 70,
                communication_written: 90,
                communication_verbal: 98,
                time_management: 90,
                strategic_thinking: 98,
                team_management: 95,
                budget_management: 95,
                stakeholder_management: 98,
                business_acumen: 98,
                executive_presence: 98,
                industry_expertise: 95,
            },
            a3: {
                work_life_balance: 20,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 98,
                impact_vs_money: 80,
                stability_vs_growth: 75,
                collaboration_vs_solo: 80,
                variety_vs_routine: 75,
            },
        },
        avgSalaryVND: '40,000,000 - 75,000,000',
        workHoursPerWeek: 65,
        stressLevel: 'very_high',
        growthPotential: 'low',
    },
    // SPECIALIZED IN-HOUSE ROLES (Content Production, Design, Events)
    {
        name: 'Graphic Designer (Marketing)',
        vietnameseName: 'Thiết kế Đồ họa (Marketing)',
        description: 'Creates visual content for marketing campaigns including social media graphics, presentations, infographics, email templates, ads, and brand materials. Works closely with marketing team to bring campaigns to life visually.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90, // Creative
                conscientiousness: 80,
                extraversion: 55,
                agreeableness: 75,
                neuroticism: 40,
                eq_emotional_intelligence: 70,
                adaptability: 75,
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 55,
                creativity: 95, // Core skill
                technical_aptitude: 85, // Design software
                communication_written: 65,
                communication_verbal: 70,
                attention_to_detail: 95,
                time_management: 75,
                digital_literacy: 85,
                visual_design: 98,
                design_software_mastery: 95, // Photoshop, Illustrator, Figma
                color_theory: 90,
                typography: 90,
                brand_consistency: 85,
            },
            a3: {
                work_life_balance: 60,
                creativity_vs_structure: 85,
                autonomy_vs_guidance: 60,
                impact_vs_money: 65,
                stability_vs_growth: 55,
                collaboration_vs_solo: 55, // Mix of both
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '10,000,000 - 18,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'high',
    },
    {
        name: 'Video Editor',
        vietnameseName: 'Biên tập Video',
        description: 'Edits and produces video content for marketing including social media videos, ads, product demos, testimonials, and promotional content. Manages video production workflow from raw footage to final delivery.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 85, // Deadline-driven
                extraversion: 55,
                agreeableness: 70,
                neuroticism: 40,
                eq_emotional_intelligence: 65,
                adaptability: 80,
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 90,
                technical_aptitude: 90, // Video software
                communication_written: 60,
                communication_verbal: 70,
                attention_to_detail: 90,
                time_management: 85, // Deadlines
                digital_literacy: 90,
                video_editing: 95, // Premiere, Final Cut
                motion_graphics: 80,
                color_grading: 85,
                audio_editing: 80,
                storytelling: 85,
            },
            a3: {
                work_life_balance: 55,
                creativity_vs_structure: 75,
                autonomy_vs_guidance: 65,
                impact_vs_money: 60,
                stability_vs_growth: 60,
                collaboration_vs_solo: 50,
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '12,000,000 - 22,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Photographer/Videographer',
        vietnameseName: 'Nhiếp ảnh gia/Quay phim',
        description: 'Captures photo and video content for marketing campaigns, products, events, and brand storytelling. Manages shoots from concept to post-production, creating visual assets for all marketing channels.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90,
                conscientiousness: 80,
                extraversion: 70, // Client interaction
                agreeableness: 75,
                neuroticism: 35,
                eq_emotional_intelligence: 75,
                adaptability: 85,
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 95,
                technical_aptitude: 90, // Camera equipment
                communication_written: 60,
                communication_verbal: 80,
                attention_to_detail: 90,
                time_management: 80,
                digital_literacy: 85,
                photography_skills: 95,
                videography_skills: 90,
                lighting: 90,
                composition: 95,
                editing: 85,
                equipment_knowledge: 90,
            },
            a3: {
                work_life_balance: 50, // Shoots can be irregular
                creativity_vs_structure: 85,
                autonomy_vs_guidance: 70,
                impact_vs_money: 65,
                stability_vs_growth: 60,
                collaboration_vs_solo: 60,
                variety_vs_routine: 90,
            },
        },
        avgSalaryVND: '12,000,000 - 25,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'moderate',
        growthPotential: 'high',
    },
    {
        name: 'Content Strategist',
        vietnameseName: 'Chuyên gia Chiến lược Nội dung',
        description: 'Develops comprehensive content strategies aligned with business goals. Plans content calendars, defines messaging frameworks, conducts audience research, and ensures content drives measurable results across all channels.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 85,
                extraversion: 65,
                agreeableness: 70,
                neuroticism: 35,
                eq_emotional_intelligence: 80,
                adaptability: 80,
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 85, // Data-driven strategy
                creativity: 85,
                technical_aptitude: 75,
                communication_written: 90,
                communication_verbal: 85,
                attention_to_detail: 80,
                time_management: 80,
                digital_literacy: 85,
                strategic_thinking: 95,
                audience_research: 90,
                seo_knowledge: 80,
                content_planning: 95,
                analytics: 85,
            },
            a3: {
                work_life_balance: 60,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 75,
                impact_vs_money: 70,
                stability_vs_growth: 60,
                collaboration_vs_solo: 70,
                variety_vs_routine: 75,
            },
        },
        avgSalaryVND: '22,000,000 - 38,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    {
        name: 'Event Marketing Specialist',
        vietnameseName: 'Chuyên viên Marketing Sự kiện',
        description: 'Plans and executes marketing events including trade shows, conferences, product launches, webinars, and experiential campaigns. Manages logistics, vendor relationships, budgets, and measures event ROI.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 90, // Detail-oriented
                extraversion: 85, // People-facing
                agreeableness: 80,
                neuroticism: 30,
                eq_emotional_intelligence: 90,
                adaptability: 90, // Things change quickly
                stress_tolerance: 85,
            },
            a2: {
                analytical_thinking: 70,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 75,
                communication_verbal: 95, // Essential
                attention_to_detail: 95,
                time_management: 90,
                digital_literacy: 75,
                project_management: 95,
                vendor_management: 85,
                budget_management: 85,
                logistics_coordination: 95,
                problem_solving: 90,
            },
            a3: {
                work_life_balance: 45, // Events = long hours
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 70,
                impact_vs_money: 65,
                stability_vs_growth: 55,
                collaboration_vs_solo: 90, // Highly collaborative
                variety_vs_routine: 95, // Every event different
            },
        },
        avgSalaryVND: '12,000,000 - 25,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'high',
    },
    {
        name: 'Motion Graphics Designer',
        vietnameseName: 'Thiết kế Chuyển động',
        description: 'Creates animated graphics, explainer videos, and motion content for digital marketing. Combines design and animation to create engaging visual content for social media, ads, and websites.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90,
                conscientiousness: 80,
                extraversion: 55,
                agreeableness: 70,
                neuroticism: 40,
                eq_emotional_intelligence: 65,
                adaptability: 80,
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 95,
                technical_aptitude: 90, // After Effects, Cinema 4D
                communication_written: 60,
                communication_verbal: 70,
                attention_to_detail: 90,
                time_management: 80,
                digital_literacy: 90,
                animation: 95,
                motion_design: 95,
                visual_design: 90,
                video_editing: 80,
                storytelling: 85,
            },
            a3: {
                work_life_balance: 55,
                creativity_vs_structure: 85,
                autonomy_vs_guidance: 65,
                impact_vs_money: 60,
                stability_vs_growth: 60,
                collaboration_vs_solo: 55,
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '15,000,000 - 28,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'UX Writer',
        vietnameseName: 'Nhà Viết Trải nghiệm Người dùng',
        description: 'Writes user-facing copy for digital products, apps, and websites. Creates microcopy, error messages, onboarding flows, and interface text that guides users and reinforces brand voice.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 85,
                extraversion: 55,
                agreeableness: 75,
                neuroticism: 35,
                eq_emotional_intelligence: 85, // User empathy
                adaptability: 75,
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 75,
                creativity: 80,
                technical_aptitude: 75, // Understanding of UX
                communication_written: 98, // Core skill
                communication_verbal: 70,
                attention_to_detail: 90,
                time_management: 75,
                digital_literacy: 85,
                user_empathy: 95,
                microcopy: 95,
                ux_principles: 85,
                clarity: 95,
                brand_voice: 85,
            },
            a3: {
                work_life_balance: 65,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 65,
                impact_vs_money: 65,
                stability_vs_growth: 60,
                collaboration_vs_solo: 75, // Works with designers/PMs
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '18,000,000 - 32,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    // ==========================================
    // PHASE 2: AGENCY MARKETING ROLES (13)
    // ==========================================
    // INTERN LEVEL (0-1 years)
    {
        name: 'Marketing Agency Intern',
        vietnameseName: 'Thực tập sinh Agency Marketing',
        description: 'Internship at marketing agency learning client servicing, campaign execution, and agency operations. Assists account teams, prepares presentations, conducts research, and learns advertising fundamentals.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 75,
                extraversion: 70, // Client-facing environment
                agreeableness: 80,
                neuroticism: 45,
                eq_emotional_intelligence: 70,
                adaptability: 85, // Fast-paced agency
                stress_tolerance: 60,
            },
            a2: {
                analytical_thinking: 55,
                creativity: 70,
                technical_aptitude: 65,
                communication_written: 70,
                communication_verbal: 70,
                attention_to_detail: 80, // Agency precision
                time_management: 70,
                digital_literacy: 75,
                learning_agility: 90,
                presentation_skills: 65,
                willingness_to_learn: 95,
            },
            a3: {
                work_life_balance: 70, // Intern hours
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 25,
                impact_vs_money: 45,
                stability_vs_growth: 75,
                collaboration_vs_solo: 80, // Team environment
                variety_vs_routine: 85, // Multiple clients
            },
        },
        avgSalaryVND: '2,000,000 - 4,500,000',
        workHoursPerWeek: 42,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    {
        name: 'Creative Intern',
        vietnameseName: 'Thực tập sinh Sáng tạo',
        description: 'Internship in agency creative department learning copywriting, design, and creative concepting. Assists copywriters and art directors, creates mock-ups, and learns advertising creativity.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85, // Creative mindset
                conscientiousness: 70,
                extraversion: 65,
                agreeableness: 75,
                neuroticism: 45,
                eq_emotional_intelligence: 70,
                adaptability: 80,
                stress_tolerance: 60,
            },
            a2: {
                analytical_thinking: 50,
                creativity: 90, // Essential
                technical_aptitude: 70,
                communication_written: 75,
                communication_verbal: 65,
                attention_to_detail: 75,
                time_management: 65,
                digital_literacy: 75,
                learning_agility: 85,
                creative_thinking: 90,
                design_basics: 70,
            },
            a3: {
                work_life_balance: 70,
                creativity_vs_structure: 80,
                autonomy_vs_guidance: 30,
                impact_vs_money: 50,
                stability_vs_growth: 75,
                collaboration_vs_solo: 70,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '1,500,000 - 3,500,000',
        workHoursPerWeek: 42,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    {
        name: 'Social Media Intern (Agency)',
        vietnameseName: 'Thực tập sinh Truyền thông Xã hội (Agency)',
        description: 'Agency internship managing social media for multiple clients. Creates posts, monitors engagement, learns community management, and assists with social media strategy.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 70,
                extraversion: 75,
                agreeableness: 80,
                neuroticism: 45,
                eq_emotional_intelligence: 75,
                adaptability: 90,
                stress_tolerance: 60,
            },
            a2: {
                analytical_thinking: 55,
                creativity: 80,
                technical_aptitude: 75,
                communication_written: 80,
                communication_verbal: 70,
                attention_to_detail: 70,
                time_management: 70,
                digital_literacy: 90, // Social media native
                learning_agility: 90,
                social_media_skills: 90,
                trend_awareness: 85,
            },
            a3: {
                work_life_balance: 65,
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 30,
                impact_vs_money: 50,
                stability_vs_growth: 75,
                collaboration_vs_solo: 75,
                variety_vs_routine: 90,
            },
        },
        avgSalaryVND: '1,500,000 - 3,500,000',
        workHoursPerWeek: 42,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    // ENTRY LEVEL (1-3 years)
    {
        name: 'Junior Account Executive',
        vietnameseName: 'Nhân viên Quản lý Tài khoản Khách hàng',
        description: 'Entry-level client-facing role at marketing agencies. Coordinates campaign execution, manages client communications, prepares reports, and supports senior account managers with day-to-day client work.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 70,
                conscientiousness: 80,
                extraversion: 75, // Client-facing
                agreeableness: 80, // Service-oriented
                neuroticism: 40,
                eq_emotional_intelligence: 75,
                adaptability: 80, // Fast-paced agency
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 60,
                technical_aptitude: 65,
                communication_written: 75,
                communication_verbal: 80,
                attention_to_detail: 85,
                time_management: 75,
                digital_literacy: 75,
                learning_agility: 80,
                client_service: 80,
                multitasking: 80,
            },
            a3: {
                work_life_balance: 50, // Agency hours
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 40,
                impact_vs_money: 55,
                stability_vs_growth: 60,
                collaboration_vs_solo: 80,
                variety_vs_routine: 80, // Multiple clients
            },
        },
        avgSalaryVND: '8,000,000 - 13,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Account Manager',
        vietnameseName: 'Quản lý Tài khoản Khách hàng',
        description: 'Manages client relationships and marketing campaigns at agencies. Develops strategic recommendations, oversees campaign execution, manages budgets, and ensures client satisfaction across multiple accounts.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 85,
                extraversion: 80,
                agreeableness: 75,
                neuroticism: 35,
                eq_emotional_intelligence: 85,
                adaptability: 85,
                stress_tolerance: 80,
                leadership: 65,
            },
            a2: {
                analytical_thinking: 75,
                creativity: 70,
                technical_aptitude: 70,
                communication_written: 85,
                communication_verbal: 90,
                attention_to_detail: 80,
                time_management: 85,
                digital_literacy: 80,
                strategic_thinking: 75,
                client_service: 90,
                multitasking: 85,
                problem_solving: 80,
            },
            a3: {
                work_life_balance: 45,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 65,
                impact_vs_money: 55,
                stability_vs_growth: 60,
                collaboration_vs_solo: 85,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '18,000,000 - 30,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    {
        name: 'Senior Account Manager',
        vietnameseName: 'Quản lý Tài khoản Cấp cao',
        description: 'Manages multiple client accounts or large strategic accounts at agencies. Leads account teams, develops campaign strategies, grows client relationships, and drives revenue growth.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 75,
                conscientiousness: 85,
                extraversion: 85,
                agreeableness: 75,
                neuroticism: 30,
                eq_emotional_intelligence: 90,
                adaptability: 85,
                stress_tolerance: 85,
                leadership: 80,
            },
            a2: {
                analytical_thinking: 80,
                creativity: 70,
                technical_aptitude: 70,
                communication_written: 85,
                communication_verbal: 95,
                attention_to_detail: 75,
                time_management: 85,
                strategic_thinking: 85,
                client_service: 95,
                multitasking: 90,
                problem_solving: 85,
                team_management: 75,
                business_development: 80,
            },
            a3: {
                work_life_balance: 40,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 75,
                impact_vs_money: 60,
                stability_vs_growth: 65,
                collaboration_vs_solo: 85,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '25,000,000 - 40,000,000',
        workHoursPerWeek: 52,
        stressLevel: 'very_high',
        growthPotential: 'high',
    },
    {
        name: 'Account Director',
        vietnameseName: 'Giám đốc Tài khoản',
        description: 'Leads major client accounts and account teams at agencies. Drives strategic direction, manages P&L, builds long-term client partnerships, and oversees multiple account managers.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 85,
                extraversion: 85,
                agreeableness: 70,
                neuroticism: 25,
                eq_emotional_intelligence: 95,
                adaptability: 85,
                stress_tolerance: 90,
                leadership: 90,
            },
            a2: {
                analytical_thinking: 85,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 85,
                communication_verbal: 95,
                time_management: 85,
                strategic_thinking: 90,
                client_service: 95,
                multitasking: 90,
                problem_solving: 90,
                team_management: 90,
                business_development: 90,
                stakeholder_management: 90,
            },
            a3: {
                work_life_balance: 35,
                creativity_vs_structure: 60,
                autonomy_vs_guidance: 85,
                impact_vs_money: 65,
                stability_vs_growth: 65,
                collaboration_vs_solo: 85,
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '35,000,000 - 60,000,000',
        workHoursPerWeek: 55,
        stressLevel: 'very_high',
        growthPotential: 'moderate',
    },
    {
        name: 'Copywriter',
        vietnameseName: 'Nhà sáng tạo Nội dung Quảng cáo',
        description: 'Creates persuasive advertising copy and marketing content for agency clients. Writes headlines, taglines, scripts, social posts, and campaign concepts. Collaborates with art directors on creative campaigns.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90, // Highly creative
                conscientiousness: 75,
                extraversion: 60,
                agreeableness: 70,
                neuroticism: 45,
                eq_emotional_intelligence: 80, // Understands audiences
                adaptability: 85,
                stress_tolerance: 70,
            },
            a2: {
                analytical_thinking: 65,
                creativity: 95, // Core skill
                technical_aptitude: 60,
                communication_written: 98, // Essential
                communication_verbal: 75,
                attention_to_detail: 80,
                time_management: 75,
                digital_literacy: 70,
                storytelling: 95,
                conceptual_thinking: 90,
                brand_voice: 90,
            },
            a3: {
                work_life_balance: 50,
                creativity_vs_structure: 85, // High creativity
                autonomy_vs_guidance: 65,
                impact_vs_money: 65,
                stability_vs_growth: 55,
                collaboration_vs_solo: 60,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '12,000,000 - 22,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Senior Copywriter',
        vietnameseName: 'Nhà sáng tạo Nội dung Cấp cao',
        description: 'Leads copywriting for major agency campaigns. Mentors junior copywriters, develops creative concepts, presents to clients, and drives award-winning creative work.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90,
                conscientiousness: 80,
                extraversion: 70,
                agreeableness: 70,
                neuroticism: 40,
                eq_emotional_intelligence: 85,
                adaptability: 85,
                stress_tolerance: 80,
                leadership: 75,
            },
            a2: {
                analytical_thinking: 70,
                creativity: 98,
                technical_aptitude: 65,
                communication_written: 98,
                communication_verbal: 85,
                attention_to_detail: 80,
                time_management: 80,
                storytelling: 98,
                conceptual_thinking: 95,
                brand_voice: 95,
                mentoring: 80,
                presentation_skills: 85,
            },
            a3: {
                work_life_balance: 45,
                creativity_vs_structure: 85,
                autonomy_vs_guidance: 75,
                impact_vs_money: 70,
                stability_vs_growth: 60,
                collaboration_vs_solo: 65,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '20,000,000 - 35,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'high',
    },
    {
        name: 'Art Director',
        vietnameseName: 'Giám đốc Nghệ thuật',
        description: 'Leads visual creative direction for agency campaigns. Develops visual concepts, oversees design execution, collaborates with copywriters, and ensures high-quality creative output for clients.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 95, // Highly creative
                conscientiousness: 80,
                extraversion: 70,
                agreeableness: 70,
                neuroticism: 40,
                eq_emotional_intelligence: 80,
                adaptability: 85,
                stress_tolerance: 75,
                leadership: 80,
            },
            a2: {
                analytical_thinking: 65,
                creativity: 98, // Essential
                technical_aptitude: 80, // Design tools
                communication_written: 70,
                communication_verbal: 80,
                attention_to_detail: 90,
                time_management: 75,
                digital_literacy: 85,
                visual_design: 98,
                conceptual_thinking: 95,
                aesthetic_sense: 98,
                design_software: 95,
            },
            a3: {
                work_life_balance: 45,
                creativity_vs_structure: 90,
                autonomy_vs_guidance: 75,
                impact_vs_money: 70,
                stability_vs_growth: 60,
                collaboration_vs_solo: 70,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '22,000,000 - 38,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'high',
    },
    {
        name: 'Creative Director',
        vietnameseName: 'Giám đốc Sáng tạo',
        description: 'Leads creative department at agency overseeing all creative output. Develops big ideas, guides creative teams (copywriters, designers, art directors), presents to senior clients, and drives creative excellence.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 95,
                conscientiousness: 85,
                extraversion: 80,
                agreeableness: 70,
                neuroticism: 35,
                eq_emotional_intelligence: 90,
                adaptability: 85,
                stress_tolerance: 85,
                leadership: 95,
                strategic_vision: 90,
            },
            a2: {
                analytical_thinking: 75,
                creativity: 98,
                technical_aptitude: 75,
                communication_written: 85,
                communication_verbal: 95,
                time_management: 80,
                strategic_thinking: 90,
                conceptual_thinking: 98,
                team_management: 90,
                presentation_skills: 95,
                client_management: 85,
                industry_expertise: 90,
            },
            a3: {
                work_life_balance: 35,
                creativity_vs_structure: 90,
                autonomy_vs_guidance: 90,
                impact_vs_money: 75,
                stability_vs_growth: 65,
                collaboration_vs_solo: 75,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '40,000,000 - 70,000,000',
        workHoursPerWeek: 55,
        stressLevel: 'very_high',
        growthPotential: 'moderate',
    },
    {
        name: 'Digital Strategist',
        vietnameseName: 'Chuyên gia Chiến lược Số',
        description: 'Develops digital marketing strategies for agency clients. Conducts research, analyzes digital ecosystems, creates strategic frameworks, and guides campaign development across digital channels.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 85,
                extraversion: 70,
                agreeableness: 70,
                neuroticism: 35,
                eq_emotional_intelligence: 80,
                adaptability: 90, // Fast-changing digital
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 90,
                creativity: 80,
                technical_aptitude: 85,
                communication_written: 85,
                communication_verbal: 85,
                attention_to_detail: 80,
                time_management: 80,
                digital_literacy: 95,
                strategic_thinking: 95,
                research_skills: 90,
                data_interpretation: 85,
                trend_analysis: 90,
            },
            a3: {
                work_life_balance: 50,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 75,
                impact_vs_money: 65,
                stability_vs_growth: 60,
                collaboration_vs_solo: 70,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '25,000,000 - 42,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Media Planner',
        vietnameseName: 'Chuyên viên Lập kế hoạch Truyền thông',
        description: 'Plans and buys media (TV, radio, digital, print, OOH) for agency clients. Develops media strategies, negotiates with vendors, allocates budgets across channels, and optimizes media mix for reach and frequency.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 70,
                conscientiousness: 90, // Detail-oriented
                extraversion: 65,
                agreeableness: 75,
                neuroticism: 35,
                eq_emotional_intelligence: 70,
                adaptability: 75,
                stress_tolerance: 80,
            },
            a2: {
                analytical_thinking: 90,
                creativity: 60,
                technical_aptitude: 80,
                communication_written: 75,
                communication_verbal: 80,
                attention_to_detail: 95,
                time_management: 85,
                digital_literacy: 85,
                strategic_thinking: 80,
                negotiation: 85,
                budget_management: 90,
                data_analysis: 90,
            },
            a3: {
                work_life_balance: 55,
                creativity_vs_structure: 45, // Structured
                autonomy_vs_guidance: 65,
                impact_vs_money: 55,
                stability_vs_growth: 60,
                collaboration_vs_solo: 70,
                variety_vs_routine: 70,
            },
        },
        avgSalaryVND: '18,000,000 - 32,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'high',
    },
    // ==========================================
    // PHASE 3: SME/STARTUP MARKETING ROLES (5)
    // ==========================================
    {
        name: 'Marketing Generalist (SME)',
        vietnameseName: 'Chuyên viên Marketing Đa năng (Doanh nghiệp SME)',
        description: 'Jack-of-all-trades marketing role for small businesses. Handles everything from social media, content, email, events, to basic analytics and design. Wears multiple hats and learns rapidly.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85, // Must be versatile
                conscientiousness: 75,
                extraversion: 70,
                agreeableness: 75,
                neuroticism: 40,
                eq_emotional_intelligence: 75,
                adaptability: 95, // Critical
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 65,
                creativity: 80,
                technical_aptitude: 75,
                communication_written: 80,
                communication_verbal: 75,
                attention_to_detail: 70,
                time_management: 80,
                digital_literacy: 85,
                learning_agility: 95, // Must learn everything
                multitasking: 90,
                problem_solving: 85,
                resourcefulness: 90,
            },
            a3: {
                work_life_balance: 60,
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 75, // High autonomy
                impact_vs_money: 60,
                stability_vs_growth: 70, // Learning focus
                collaboration_vs_solo: 60,
                variety_vs_routine: 90, // Extreme variety
            },
        },
        avgSalaryVND: '10,000,000 - 18,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
    {
        name: 'Growth Hacker',
        vietnameseName: 'Chuyên gia Tăng trưởng',
        description: 'Experiments across marketing channels to drive rapid user acquisition and growth for startups. Data-driven, technical, and creative. Runs A/B tests, optimizes funnels, and finds scalable growth tactics.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 95, // Experimental mindset
                conscientiousness: 75,
                extraversion: 60,
                agreeableness: 65,
                neuroticism: 40,
                eq_emotional_intelligence: 70,
                adaptability: 95,
                stress_tolerance: 80,
            },
            a2: {
                analytical_thinking: 95, // Core skill
                creativity: 85, // Creative problem solving
                technical_aptitude: 90, // Coding helpful
                communication_written: 75,
                communication_verbal: 70,
                attention_to_detail: 80,
                time_management: 75,
                digital_literacy: 95,
                learning_agility: 95,
                experimentation: 98,
                data_analysis: 95,
                optimization: 95,
            },
            a3: {
                work_life_balance: 50,
                creativity_vs_structure: 75,
                autonomy_vs_guidance: 85,
                impact_vs_money: 65,
                stability_vs_growth: 70,
                collaboration_vs_solo: 50,
                variety_vs_routine: 95,
            },
        },
        avgSalaryVND: '18,000,000 - 32,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    {
        name: 'Marketing Manager (SME)',
        vietnameseName: 'Quản lý Marketing (Doanh nghiệp SME)',
        description: 'Leads marketing for small-medium business, often with small team or solo. Develops strategy, executes campaigns hands-on, manages budget, and drives growth with limited resources.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 80,
                extraversion: 75,
                agreeableness: 75,
                neuroticism: 35,
                eq_emotional_intelligence: 80,
                adaptability: 90,
                stress_tolerance: 80,
                leadership: 75,
            },
            a2: {
                analytical_thinking: 80,
                creativity: 80,
                technical_aptitude: 80,
                communication_written: 80,
                communication_verbal: 85,
                attention_to_detail: 75,
                time_management: 85,
                digital_literacy: 85,
                strategic_thinking: 80,
                multitasking: 90,
                budget_management: 80,
                resourcefulness: 90,
            },
            a3: {
                work_life_balance: 55,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 85,
                impact_vs_money: 65,
                stability_vs_growth: 65,
                collaboration_vs_solo: 65,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '18,000,000 - 30,000,000',
        workHoursPerWeek: 50,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    {
        name: 'Head of Marketing (SME)',
        vietnameseName: 'Trưởng phòng Marketing (Doanh nghiệp SME)',
        description: 'Builds and leads marketing function for growing SME. Develops strategy, manages team (3-8 people), drives revenue growth, and establishes marketing foundations and processes.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 85,
                extraversion: 80,
                agreeableness: 75,
                neuroticism: 30,
                eq_emotional_intelligence: 85,
                adaptability: 85,
                stress_tolerance: 85,
                leadership: 85,
            },
            a2: {
                analytical_thinking: 85,
                creativity: 75,
                technical_aptitude: 75,
                communication_written: 85,
                communication_verbal: 90,
                time_management: 85,
                digital_literacy: 80,
                strategic_thinking: 90,
                team_management: 85,
                budget_management: 85,
                business_acumen: 85,
                process_building: 85,
            },
            a3: {
                work_life_balance: 45,
                creativity_vs_structure: 65,
                autonomy_vs_guidance: 90,
                impact_vs_money: 70,
                stability_vs_growth: 65,
                collaboration_vs_solo: 75,
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '25,000,000 - 45,000,000',
        workHoursPerWeek: 55,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    {
        name: 'VP of Marketing (Startup)',
        vietnameseName: 'Phó Chủ tịch Marketing (Startup)',
        description: 'First senior marketing hire building marketing organization from scratch for startups. Defines strategy, builds team, drives growth metrics, and works closely with founders to scale company.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 90, // Startup mindset
                conscientiousness: 85,
                extraversion: 80,
                agreeableness: 70,
                neuroticism: 25,
                eq_emotional_intelligence: 90,
                adaptability: 95, // High uncertainty
                stress_tolerance: 95,
                leadership: 90,
                entrepreneurial_spirit: 95,
            },
            a2: {
                analytical_thinking: 90,
                creativity: 85,
                technical_aptitude: 80,
                communication_written: 85,
                communication_verbal: 95,
                time_management: 90,
                strategic_thinking: 95,
                team_management: 90,
                budget_management: 90,
                business_acumen: 95,
                startup_experience: 90,
                versatility: 95,
            },
            a3: {
                work_life_balance: 30, // Startup hours
                creativity_vs_structure: 75,
                autonomy_vs_guidance: 95,
                impact_vs_money: 75, // Often equity-based
                stability_vs_growth: 80, // Growth focus
                collaboration_vs_solo: 80,
                variety_vs_routine: 90,
            },
        },
        avgSalaryVND: '30,000,000 - 60,000,000 (+ equity)',
        workHoursPerWeek: 60,
        stressLevel: 'very_high',
        growthPotential: 'very_high',
    },
    // ==========================================
    // PHASE 4: SPECIALIZED ROLES (3)
    // ==========================================
    {
        name: 'SEO/SEM Specialist',
        vietnameseName: 'Chuyên viên SEO/SEM',
        description: 'Technical specialist optimizing websites for search engines (SEO) and managing paid search campaigns (SEM). Conducts keyword research, technical audits, link building, and PPC campaign management.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 70,
                conscientiousness: 90, // Detail-oriented
                extraversion: 50,
                agreeableness: 65,
                neuroticism: 35,
                eq_emotional_intelligence: 60,
                adaptability: 85, // Algorithm changes
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 95,
                creativity: 60,
                technical_aptitude: 90, // HTML, analytics, tools
                communication_written: 75,
                communication_verbal: 65,
                attention_to_detail: 95,
                time_management: 75,
                digital_literacy: 95,
                learning_agility: 85,
                data_analysis: 95,
                technical_seo: 95,
                keyword_research: 90,
            },
            a3: {
                work_life_balance: 65,
                creativity_vs_structure: 40,
                autonomy_vs_guidance: 70,
                impact_vs_money: 55,
                stability_vs_growth: 60,
                collaboration_vs_solo: 45,
                variety_vs_routine: 55,
            },
        },
        avgSalaryVND: '12,000,000 - 20,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'very_high',
    },
    {
        name: 'Community Manager',
        vietnameseName: 'Quản lý Cộng đồng',
        description: 'Builds and nurtures online communities around brands. Manages social engagement, moderates discussions, creates community content, organizes events, and turns customers into brand advocates.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 80,
                conscientiousness: 70,
                extraversion: 90, // Highly social
                agreeableness: 85, // Empathetic
                neuroticism: 35,
                eq_emotional_intelligence: 95, // Essential
                adaptability: 85,
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 60,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 90,
                communication_verbal: 95,
                attention_to_detail: 70,
                time_management: 75,
                digital_literacy: 85,
                social_skills: 95,
                empathy: 95,
                conflict_resolution: 85,
                community_building: 95,
            },
            a3: {
                work_life_balance: 55, // Always-on
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 65,
                impact_vs_money: 70, // Community impact
                stability_vs_growth: 60,
                collaboration_vs_solo: 90,
                variety_vs_routine: 80,
            },
        },
        avgSalaryVND: '10,000,000 - 18,000,000',
        workHoursPerWeek: 45,
        stressLevel: 'moderate',
        growthPotential: 'high',
    },
    {
        name: 'Influencer Marketing Manager',
        vietnameseName: 'Quản lý Marketing Người ảnh hưởng',
        description: 'Manages influencer partnerships and campaigns. Identifies influencers, negotiates contracts, coordinates campaigns, tracks performance, and builds long-term creator relationships.',
        category: 'marketing',
        requirements: {
            a1: {
                openness: 85,
                conscientiousness: 75,
                extraversion: 85, // Relationship building
                agreeableness: 80,
                neuroticism: 40,
                eq_emotional_intelligence: 90,
                adaptability: 85,
                stress_tolerance: 75,
            },
            a2: {
                analytical_thinking: 70,
                creativity: 75,
                technical_aptitude: 70,
                communication_written: 80,
                communication_verbal: 90,
                attention_to_detail: 75,
                time_management: 80,
                digital_literacy: 90,
                social_media_savvy: 95,
                relationship_building: 95,
                negotiation: 85,
                trend_awareness: 90,
            },
            a3: {
                work_life_balance: 60,
                creativity_vs_structure: 70,
                autonomy_vs_guidance: 70,
                impact_vs_money: 60,
                stability_vs_growth: 60,
                collaboration_vs_solo: 85,
                variety_vs_routine: 85,
            },
        },
        avgSalaryVND: '18,000,000 - 32,000,000',
        workHoursPerWeek: 48,
        stressLevel: 'high',
        growthPotential: 'very_high',
    },
];
exports.marketingCareers = marketingCareers;
/**
 * Seed function to populate marketing careers
 */
async function seedMarketingCareers() {
    console.log('🌱 Starting marketing careers seed...');
    let created = 0;
    let updated = 0;
    let skipped = 0;
    for (const career of marketingCareers) {
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
            }
            else {
                // Create new career
                await prisma.career.create({
                    data: career,
                });
                created++;
                console.log(`✨ Created: ${career.name}`);
            }
        }
        catch (error) {
            console.error(`❌ Error processing ${career.name}:`, error.message);
            skipped++;
        }
    }
    console.log('\n📊 Marketing Careers Seed Summary:');
    console.log(`   ✨ Created: ${created}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Skipped: ${skipped}`);
    console.log(`   📦 Total: ${marketingCareers.length}`);
}
/**
 * Main execution
 */
async function main() {
    try {
        await seedMarketingCareers();
    }
    catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
    finally {
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
