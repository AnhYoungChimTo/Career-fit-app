import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided. Please login to access this resource.',
        },
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request object
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error.message || 'Invalid or expired token. Please login again.',
      },
    });
  }
}

/**
 * Optional auth middleware - doesn't fail if token is missing
 * Useful for endpoints that work with or without auth
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      (req as any).userId = decoded.userId;
      (req as any).userEmail = decoded.email;
    }

    next();
  } catch (error) {
    // Ignore errors, continue without auth
    next();
  }
}
