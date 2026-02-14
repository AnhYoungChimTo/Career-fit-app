import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/reset-password
 * Reset password using security question
 */
router.post('/reset-password', authController.resetPassword);

/**
 * GET /api/auth/me
 * Get current user (protected route)
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout (client-side handles token removal)
 */
router.post('/logout', authController.logout);

export default router;
