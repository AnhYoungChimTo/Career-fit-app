import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/careers
 * Fetch all careers with optional filtering and search
 *
 * Query params:
 * - search: string (search in name, vietnameseName, description)
 * - category: string (filter by category - marketing, tech, finance, etc.)
 * - experienceLevel: string (intern, entry, mid, senior, executive)
 * - minSalary: number (minimum salary in VND)
 * - maxSalary: number (maximum salary in VND)
 * - stressLevel: string (low, medium, high, very_high)
 * - growthPotential: string (low, medium, high, very_high)
 * - limit: number (default 50)
 * - offset: number (default 0)
 */
export const getAllCareers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      experienceLevel,
      minSalary,
      maxSalary,
      stressLevel,
      growthPotential,
      limit = 50,
      offset = 0,
    } = req.query;

    // Build filter conditions
    const where: any = {};

    // Search filter (searches in name, vietnameseName, and description)
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { vietnameseName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Stress level filter
    if (stressLevel && typeof stressLevel === 'string') {
      where.stressLevel = stressLevel;
    }

    // Growth potential filter
    if (growthPotential && typeof growthPotential === 'string') {
      where.growthPotential = growthPotential;
    }

    // Fetch careers from database
    const [careers, totalCount] = await Promise.all([
      prisma.career.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { name: 'asc' },
      }),
      prisma.career.count({ where }),
    ]);

    // Category filter (now using the actual category field from database)
    if (category && typeof category === 'string') {
      where.category = category;
    }

    // Re-fetch with category filter if it was added
    let filteredCareers = careers;
    if (category && typeof category === 'string') {
      filteredCareers = await prisma.career.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { name: 'asc' },
      });
    }

    // Experience level filter (based on name patterns)
    if (experienceLevel && typeof experienceLevel === 'string') {
      const levelLower = experienceLevel.toLowerCase();
      filteredCareers = filteredCareers.filter(career => {
        const nameLower = career.name.toLowerCase();

        switch (levelLower) {
          case 'intern':
            return nameLower.includes('intern');
          case 'entry':
            return (nameLower.includes('junior') ||
                   nameLower.includes('coordinator') ||
                   nameLower.includes('specialist') ||
                   nameLower.includes('analyst')) &&
                   !nameLower.includes('senior') &&
                   !nameLower.includes('manager') &&
                   !nameLower.includes('director');
          case 'mid':
            return (nameLower.includes('manager') ||
                   nameLower.includes('lead')) &&
                   !nameLower.includes('senior') &&
                   !nameLower.includes('director') &&
                   !nameLower.includes('vp') &&
                   !nameLower.includes('cmo') &&
                   !nameLower.includes('head of');
          case 'senior':
            return (nameLower.includes('senior') ||
                   nameLower.includes('director') ||
                   nameLower.includes('head of')) &&
                   !nameLower.includes('vp') &&
                   !nameLower.includes('cmo') &&
                   !nameLower.includes('chief');
          case 'executive':
            return nameLower.includes('vp') ||
                   nameLower.includes('cmo') ||
                   nameLower.includes('chief') ||
                   (nameLower.includes('executive') && !nameLower.includes('account'));
          default:
            return true;
        }
      });
    }

    // Salary filter (parse salary ranges and filter)
    if (minSalary || maxSalary) {
      filteredCareers = filteredCareers.filter(career => {
        if (!career.avgSalaryVND) return false;

        // Parse salary range (format: "10,000,000 - 20,000,000")
        const salaryParts = career.avgSalaryVND.split('-').map(s =>
          parseInt(s.trim().replace(/,/g, ''))
        );

        if (salaryParts.length !== 2) return false;

        const [careerMinSalary, careerMaxSalary] = salaryParts;

        // Check if career salary range overlaps with filter range
        if (minSalary && careerMaxSalary < Number(minSalary)) return false;
        if (maxSalary && careerMinSalary > Number(maxSalary)) return false;

        return true;
      });
    }

    // Transform careers to include parsed data
    const transformedCareers = filteredCareers.map(career => {
      // Parse salary range
      let salaryRange = { min: 0, max: 0 };
      if (career.avgSalaryVND) {
        const salaryParts = career.avgSalaryVND.split('-').map(s =>
          parseInt(s.trim().replace(/,/g, ''))
        );
        if (salaryParts.length === 2) {
          salaryRange = { min: salaryParts[0], max: salaryParts[1] };
        }
      }

      // Use actual category from database
      const getCategory = (): string => {
        return career.category || 'general';
      };

      // Infer experience level
      const inferExperienceLevel = (): string => {
        const name = career.name.toLowerCase();
        if (name.includes('intern')) return 'Intern';
        if (name.includes('vp') || name.includes('cmo') || name.includes('chief')) return 'Executive';
        if (name.includes('senior') || name.includes('director') || name.includes('head of')) return 'Senior';
        if (name.includes('manager') || name.includes('lead')) return 'Mid-Level';
        if (name.includes('junior') || name.includes('coordinator') || name.includes('specialist')) return 'Entry';
        return 'Mid-Level';
      };

      return {
        id: career.id,
        name: career.name,
        vietnameseName: career.vietnameseName,
        description: career.description,
        avgSalaryVND: career.avgSalaryVND,
        salaryRange,
        workHoursPerWeek: career.workHoursPerWeek,
        stressLevel: career.stressLevel,
        growthPotential: career.growthPotential,
        category: getCategory(),
        experienceLevel: inferExperienceLevel(),
        requirements: career.requirements,
        createdAt: career.createdAt,
        updatedAt: career.updatedAt,
      };
    });

    return res.json({
      success: true,
      data: {
        careers: transformedCareers,
        pagination: {
          total: totalCount,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + transformedCareers.length < totalCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching careers:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CAREERS_ERROR',
        message: 'Failed to fetch careers',
      },
    });
  }
};

/**
 * GET /api/careers/:id
 * Get single career by ID with full details
 */
export const getCareerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const career = await prisma.career.findUnique({
      where: { id: String(id) },
    });

    if (!career) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CAREER_NOT_FOUND',
          message: 'Career not found',
        },
      });
    }

    // Parse salary range
    let salaryRange = { min: 0, max: 0 };
    if (career.avgSalaryVND) {
      const salaryParts = career.avgSalaryVND.split('-').map(s =>
        parseInt(s.trim().replace(/,/g, ''))
      );
      if (salaryParts.length === 2) {
        salaryRange = { min: salaryParts[0], max: salaryParts[1] };
      }
    }

    return res.json({
      success: true,
      data: {
        ...career,
        salaryRange,
      },
    });
  } catch (error: any) {
    console.error('Error fetching career:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_CAREER_ERROR',
        message: 'Failed to fetch career',
      },
    });
  }
};

/**
 * GET /api/careers/stats
 * Get career statistics (total count, categories, etc.)
 */
export const getCareerStats = async (req: Request, res: Response) => {
  try {
    const totalCareers = await prisma.career.count();

    const allCareers = await prisma.career.findMany({
      select: {
        name: true,
        category: true,
        stressLevel: true,
        growthPotential: true,
      },
    });

    // Count by category (using actual category field)
    const byCategory = allCareers.reduce((acc: any, career) => {
      const category = career.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Count by stress level
    const byStressLevel = allCareers.reduce((acc: any, career) => {
      const level = career.stressLevel || 'unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Count by growth potential
    const byGrowthPotential = allCareers.reduce((acc: any, career) => {
      const level = career.growthPotential || 'unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        totalCareers,
        byCategory,
        byStressLevel,
        byGrowthPotential,
      },
    });
  } catch (error: any) {
    console.error('Error fetching career stats:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_STATS_ERROR',
        message: 'Failed to fetch career statistics',
      },
    });
  }
};
