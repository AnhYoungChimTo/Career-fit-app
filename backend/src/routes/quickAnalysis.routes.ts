import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { generateQuickAnalysis, getQuickAnalysisUsage } from '../controllers/quickAnalysis.controller';

const router = Router();

// GET /api/quick-analysis/usage — returns how many uses remain for this account
router.get('/usage', authMiddleware, getQuickAnalysisUsage);

// POST /api/quick-analysis — generate analysis (requires auth, limited to 3 free uses)
router.post('/', authMiddleware, generateQuickAnalysis);

export default router;
