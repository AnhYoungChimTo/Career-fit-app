"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePortfolioItem = exports.updatePortfolioItem = exports.addPortfolioItem = exports.deleteEducation = exports.updateEducation = exports.addEducation = exports.deleteExperience = exports.updateExperience = exports.addExperience = exports.deleteSkill = exports.updateSkill = exports.addSkill = exports.upsertProfile = exports.getMyProfile = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ===== PROFILE =====
const getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
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
        const requestingUserId = req.userId;
        if (profile.visibility === 'private' && requestingUserId !== userId) {
            return res.status(403).json({
                success: false,
                error: { code: 'PROFILE_PRIVATE', message: 'This profile is private' },
            });
        }
        return res.json({ success: true, data: profile });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'FETCH_PROFILE_ERROR', message: 'Failed to fetch profile' },
        });
    }
};
exports.getProfile = getProfile;
const getMyProfile = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'FETCH_PROFILE_ERROR', message: 'Failed to fetch profile' },
        });
    }
};
exports.getMyProfile = getMyProfile;
const upsertProfile = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Error upserting profile:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'UPSERT_PROFILE_ERROR', message: 'Failed to update profile' },
        });
    }
};
exports.upsertProfile = upsertProfile;
// ===== SKILLS =====
const addSkill = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
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
exports.addSkill = addSkill;
const updateSkill = async (req, res) => {
    try {
        const skillId = req.params.skillId;
        const { name, level } = req.body;
        const skill = await prisma.skill.update({
            where: { id: skillId },
            data: { name, level },
        });
        return res.json({ success: true, data: skill });
    }
    catch (error) {
        console.error('Error updating skill:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'UPDATE_SKILL_ERROR', message: 'Failed to update skill' },
        });
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res) => {
    try {
        const skillId = req.params.skillId;
        await prisma.skill.delete({ where: { id: skillId } });
        return res.json({ success: true, data: { message: 'Skill deleted' } });
    }
    catch (error) {
        console.error('Error deleting skill:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'DELETE_SKILL_ERROR', message: 'Failed to delete skill' },
        });
    }
};
exports.deleteSkill = deleteSkill;
// ===== EXPERIENCE =====
const addExperience = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Error adding experience:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'ADD_EXPERIENCE_ERROR', message: 'Failed to add experience' },
        });
    }
};
exports.addExperience = addExperience;
const updateExperience = async (req, res) => {
    try {
        const expId = req.params.expId;
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
    }
    catch (error) {
        console.error('Error updating experience:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'UPDATE_EXPERIENCE_ERROR', message: 'Failed to update experience' },
        });
    }
};
exports.updateExperience = updateExperience;
const deleteExperience = async (req, res) => {
    try {
        const expId = req.params.expId;
        await prisma.experience.delete({ where: { id: expId } });
        return res.json({ success: true, data: { message: 'Experience deleted' } });
    }
    catch (error) {
        console.error('Error deleting experience:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'DELETE_EXPERIENCE_ERROR', message: 'Failed to delete experience' },
        });
    }
};
exports.deleteExperience = deleteExperience;
// ===== EDUCATION =====
const addEducation = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Error adding education:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'ADD_EDUCATION_ERROR', message: 'Failed to add education' },
        });
    }
};
exports.addEducation = addEducation;
const updateEducation = async (req, res) => {
    try {
        const eduId = req.params.eduId;
        const { degree, institution, major, graduationYear, description } = req.body;
        const education = await prisma.education.update({
            where: { id: eduId },
            data: { degree, institution, major, graduationYear, description },
        });
        return res.json({ success: true, data: education });
    }
    catch (error) {
        console.error('Error updating education:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'UPDATE_EDUCATION_ERROR', message: 'Failed to update education' },
        });
    }
};
exports.updateEducation = updateEducation;
const deleteEducation = async (req, res) => {
    try {
        const eduId = req.params.eduId;
        await prisma.education.delete({ where: { id: eduId } });
        return res.json({ success: true, data: { message: 'Education deleted' } });
    }
    catch (error) {
        console.error('Error deleting education:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'DELETE_EDUCATION_ERROR', message: 'Failed to delete education' },
        });
    }
};
exports.deleteEducation = deleteEducation;
// ===== PORTFOLIO =====
const addPortfolioItem = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
        console.error('Error adding portfolio item:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'ADD_PORTFOLIO_ERROR', message: 'Failed to add portfolio item' },
        });
    }
};
exports.addPortfolioItem = addPortfolioItem;
const updatePortfolioItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
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
    }
    catch (error) {
        console.error('Error updating portfolio item:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'UPDATE_PORTFOLIO_ERROR', message: 'Failed to update portfolio item' },
        });
    }
};
exports.updatePortfolioItem = updatePortfolioItem;
const deletePortfolioItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        await prisma.portfolioItem.delete({ where: { id: itemId } });
        return res.json({ success: true, data: { message: 'Portfolio item deleted' } });
    }
    catch (error) {
        console.error('Error deleting portfolio item:', error);
        return res.status(500).json({
            success: false,
            error: { code: 'DELETE_PORTFOLIO_ERROR', message: 'Failed to delete portfolio item' },
        });
    }
};
exports.deletePortfolioItem = deletePortfolioItem;
