import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import * as profileController from '../controllers/profile.controller';

const router = Router();

// Profile
router.get('/me', authMiddleware, profileController.getMyProfile);
router.get('/:userId', optionalAuthMiddleware, profileController.getProfile);
router.post('/', authMiddleware, profileController.upsertProfile);

// Skills
router.post('/skills', authMiddleware, profileController.addSkill);
router.put('/skills/:skillId', authMiddleware, profileController.updateSkill);
router.delete('/skills/:skillId', authMiddleware, profileController.deleteSkill);

// Experience
router.post('/experience', authMiddleware, profileController.addExperience);
router.put('/experience/:expId', authMiddleware, profileController.updateExperience);
router.delete('/experience/:expId', authMiddleware, profileController.deleteExperience);

// Education
router.post('/education', authMiddleware, profileController.addEducation);
router.put('/education/:eduId', authMiddleware, profileController.updateEducation);
router.delete('/education/:eduId', authMiddleware, profileController.deleteEducation);

// Portfolio
router.post('/portfolio', authMiddleware, profileController.addPortfolioItem);
router.put('/portfolio/:itemId', authMiddleware, profileController.updatePortfolioItem);
router.delete('/portfolio/:itemId', authMiddleware, profileController.deletePortfolioItem);

export default router;
