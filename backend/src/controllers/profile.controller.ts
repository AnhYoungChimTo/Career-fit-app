import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===== PROFILE =====

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        skills: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        educationRecords: { orderBy: { graduationYear: 'desc' } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' },
      });
    }

    // Check privacy
    const requestingUserId = (req as any).userId;
    if (profile.visibility === 'private' && requestingUserId !== userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'PROFILE_PRIVATE', message: 'This profile is private' },
      });
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_PROFILE_ERROR', message: 'Failed to fetch profile' },
    });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        skills: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        educationRecords: { orderBy: { graduationYear: 'desc' } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found. Create one first.' },
      });
    }

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_PROFILE_ERROR', message: 'Failed to fetch profile' },
    });
  }
};

export const upsertProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { firstName, lastName, profilePhoto, headline, location, bio, linkedIn, github, portfolioUrl, twitter, visibility } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'First name and last name are required' },
      });
    }

    const data = { firstName, lastName, profilePhoto, headline, location, bio, linkedIn, github, portfolioUrl, twitter, visibility };

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: {
        skills: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        educationRecords: { orderBy: { graduationYear: 'desc' } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Error upserting profile:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPSERT_PROFILE_ERROR', message: 'Failed to update profile' },
    });
  }
};

// ===== SKILLS =====

export const addSkill = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, level } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Skill name is required' },
      });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Create a profile first' },
      });
    }

    const skill = await prisma.skill.create({
      data: {
        profileId: profile.id,
        name,
        level: level || 'beginner',
      },
    });

    return res.json({ success: true, data: skill });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_SKILL', message: 'This skill already exists on your profile' },
      });
    }
    console.error('Error adding skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_SKILL_ERROR', message: 'Failed to add skill' },
    });
  }
};

export const updateSkill = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.skillId as string;
    const { name, level } = req.body;

    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: { name, level },
    });

    return res.json({ success: true, data: skill });
  } catch (error: any) {
    console.error('Error updating skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_SKILL_ERROR', message: 'Failed to update skill' },
    });
  }
};

export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.skillId as string;
    await prisma.skill.delete({ where: { id: skillId } });
    return res.json({ success: true, data: { message: 'Skill deleted' } });
  } catch (error: any) {
    console.error('Error deleting skill:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_SKILL_ERROR', message: 'Failed to delete skill' },
    });
  }
};

// ===== EXPERIENCE =====

export const addExperience = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, company, location, startDate, endDate, current, description } = req.body;

    if (!title || !company || !startDate || !description) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, company, start date, and description are required' },
      });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Create a profile first' },
      });
    }

    const experience = await prisma.experience.create({
      data: {
        profileId: profile.id,
        title,
        company,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        current: current || false,
        description,
      },
    });

    return res.json({ success: true, data: experience });
  } catch (error: any) {
    console.error('Error adding experience:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_EXPERIENCE_ERROR', message: 'Failed to add experience' },
    });
  }
};

export const updateExperience = async (req: Request, res: Response) => {
  try {
    const expId = req.params.expId as string;
    const { title, company, location, startDate, endDate, current, description } = req.body;

    const experience = await prisma.experience.update({
      where: { id: expId },
      data: {
        title,
        company,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        current,
        description,
      },
    });

    return res.json({ success: true, data: experience });
  } catch (error: any) {
    console.error('Error updating experience:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_EXPERIENCE_ERROR', message: 'Failed to update experience' },
    });
  }
};

export const deleteExperience = async (req: Request, res: Response) => {
  try {
    const expId = req.params.expId as string;
    await prisma.experience.delete({ where: { id: expId } });
    return res.json({ success: true, data: { message: 'Experience deleted' } });
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_EXPERIENCE_ERROR', message: 'Failed to delete experience' },
    });
  }
};

// ===== EDUCATION =====

export const addEducation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { degree, institution, major, graduationYear, description } = req.body;

    if (!degree || !institution || !graduationYear) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Degree, institution, and graduation year are required' },
      });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Create a profile first' },
      });
    }

    const education = await prisma.education.create({
      data: {
        profileId: profile.id,
        degree,
        institution,
        major,
        graduationYear,
        description,
      },
    });

    return res.json({ success: true, data: education });
  } catch (error: any) {
    console.error('Error adding education:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_EDUCATION_ERROR', message: 'Failed to add education' },
    });
  }
};

export const updateEducation = async (req: Request, res: Response) => {
  try {
    const eduId = req.params.eduId as string;
    const { degree, institution, major, graduationYear, description } = req.body;

    const education = await prisma.education.update({
      where: { id: eduId },
      data: { degree, institution, major, graduationYear, description },
    });

    return res.json({ success: true, data: education });
  } catch (error: any) {
    console.error('Error updating education:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_EDUCATION_ERROR', message: 'Failed to update education' },
    });
  }
};

export const deleteEducation = async (req: Request, res: Response) => {
  try {
    const eduId = req.params.eduId as string;
    await prisma.education.delete({ where: { id: eduId } });
    return res.json({ success: true, data: { message: 'Education deleted' } });
  } catch (error: any) {
    console.error('Error deleting education:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_EDUCATION_ERROR', message: 'Failed to delete education' },
    });
  }
};

// ===== PORTFOLIO =====

export const addPortfolioItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, type, url, imageUrl, skills, startDate, endDate } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, description, and type are required' },
      });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Create a profile first' },
      });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        profileId: profile.id,
        title,
        description,
        type,
        url,
        imageUrl,
        skills: skills || [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return res.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error adding portfolio item:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_PORTFOLIO_ERROR', message: 'Failed to add portfolio item' },
    });
  }
};

export const updatePortfolioItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId as string;
    const { title, description, type, url, imageUrl, skills, startDate, endDate } = req.body;

    const item = await prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        title,
        description,
        type,
        url,
        imageUrl,
        skills,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    return res.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Error updating portfolio item:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_PORTFOLIO_ERROR', message: 'Failed to update portfolio item' },
    });
  }
};

export const deletePortfolioItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId as string;
    await prisma.portfolioItem.delete({ where: { id: itemId } });
    return res.json({ success: true, data: { message: 'Portfolio item deleted' } });
  } catch (error: any) {
    console.error('Error deleting portfolio item:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_PORTFOLIO_ERROR', message: 'Failed to delete portfolio item' },
    });
  }
};
