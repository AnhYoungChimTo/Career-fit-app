import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import * as resultsController from '../controllers/results.controller';

const router = Router();

// Protected routes (require authentication)
router.get('/:interviewId', authMiddleware, resultsController.getResults);
router.get('/:interviewId/pdf', authMiddleware, resultsController.downloadPDF);

export default router;
