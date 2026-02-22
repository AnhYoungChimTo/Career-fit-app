import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateQuickAnalysis } from '../controllers/quickAnalysis.controller';

const router = Router();

// POST /api/quick-analysis — requires auth to prevent anonymous API abuse
router.post('/', authMiddleware, generateQuickAnalysis);

export default router;
