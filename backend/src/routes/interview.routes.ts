import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as interviewController from '../controllers/interview.controller';

const router = Router();

// Public routes (questions)
router.get('/questions/lite', interviewController.getLiteQuestions);
router.get('/questions/deep/modules', interviewController.getDeepModulesMetadata);
router.get('/questions/deep/:moduleId', interviewController.getDeepModule);

// Protected routes (require authentication)
router.post('/start', authMiddleware, interviewController.startInterview);
router.get('/my-interviews', authMiddleware, interviewController.getMyInterviews);
router.get('/:id', authMiddleware, interviewController.getInterviewStatus);
router.put('/:id/answer', authMiddleware, interviewController.saveAnswer);
router.put('/:id/position', authMiddleware, interviewController.updatePosition);
router.post('/:id/complete-module', authMiddleware, interviewController.completeModule);
router.post('/:id/complete', authMiddleware, interviewController.completeInterview);

export default router;
