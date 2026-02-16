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
 * GET /api/auth/security-question
 * Get security question by email
 */
router.get('/security-question', authController.getSecurityQuestion);

/**
 * POST /api/auth/verify-security-answer
 * Verify security answer before password reset
 */
router.post('/verify-security-answer', authController.verifySecurityAnswer);

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
 * POST /api/auth/change-password
 * Change user password (protected route)
 */
router.post('/change-password', authMiddleware, authController.changePassword);

/**
 * PUT /api/auth/profile
 * Update user profile (protected route)
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * POST /api/auth/logout
 * Logout (client-side handles token removal)
 */
router.post('/logout', authController.logout);

export default router;
