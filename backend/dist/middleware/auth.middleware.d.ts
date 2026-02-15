import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to verify JWT token and attach user info to request
 */
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
/**
 * Optional auth middleware - doesn't fail if token is missing
 * Useful for endpoints that work with or without auth
 */
export declare function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map