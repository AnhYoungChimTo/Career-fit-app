import { Request, Response } from 'express';
/**
 * Register a new user
 * POST /api/auth/register
 */
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Login user
 * POST /api/auth/login
 */
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Reset password using security question
 * POST /api/auth/reset-password
 */
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get current user
 * GET /api/auth/me
 */
export declare function getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Logout (client-side handles token removal)
 * POST /api/auth/logout
 */
export declare function logout(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map