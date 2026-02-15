import { Router } from 'express';
import { getAllCareers, getCareerById, getCareerStats } from '../controllers/careers.controller';

const router = Router();

/**
 * GET /api/careers/stats
 * Get career statistics
 * Public endpoint - no auth required
 */
router.get('/stats', getCareerStats);

/**
 * GET /api/careers
 * Get all careers with optional filters
 * Public endpoint - no auth required (allows users to browse before registering)
 */
router.get('/', getAllCareers);

/**
 * GET /api/careers/:id
 * Get single career by ID
 * Public endpoint - no auth required
 */
router.get('/:id', getCareerById);

export default router;
