import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { RegisterRequest, LoginRequest, PasswordResetRequest } from '../types';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response) {
  try {
    const data: RegisterRequest = req.body;

    // Validate required fields
    if (!data.email || !data.password || !data.securityQuestion || !data.securityAnswer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, security question, and security answer are required',
        },
      });
    }

    const result = await authService.registerUser(data);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  try {
    const data: LoginRequest = req.body;

    // Validate required fields
    if (!data.email || !data.password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    const result = await authService.loginUser(data);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Get security question by email
 * GET /api/auth/security-question?email=xxx
 */
export async function getSecurityQuestion(req: Request, res: Response) {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const result = await authService.getSecurityQuestion(email);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: error.message,
      },
    });
  }
}

/**
 * Verify security answer
 * POST /api/auth/verify-security-answer
 */
export async function verifySecurityAnswer(req: Request, res: Response) {
  try {
    const { email, securityAnswer } = req.body;

    // Validate required fields
    if (!email || !securityAnswer) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and security answer are required',
        },
      });
    }

    const result = await authService.verifySecurityAnswer(email, securityAnswer);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Security answer verified',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Reset password using security question
 * POST /api/auth/reset-password
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const data: PasswordResetRequest = req.body;

    // Validate required fields
    if (!data.email || !data.securityAnswer || !data.newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, security answer, and new password are required',
        },
      });
    }

    const result = await authService.resetPassword(data);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Password reset successful',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Get current user
 * GET /api/auth/me
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    // User ID is attached by auth middleware
    const userId = (req as any).userId;

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Change password
 * POST /api/auth/change-password
 */
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required',
        },
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'CHANGE_PASSWORD_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.email;
    delete updates.password;
    delete updates.id;

    const updatedUser = await authService.updateUserProfile(userId, updates);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: error.message,
      },
    });
  }
}

/**
 * Logout (client-side handles token removal)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.',
  });
}
