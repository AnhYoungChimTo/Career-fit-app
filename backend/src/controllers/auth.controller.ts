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
 * Logout (client-side handles token removal)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  res.status(200).json({
    success: true,
    message: 'Logout successful. Please remove the token from client storage.',
  });
}
