"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware to verify JWT token and attach user info to request
 */
function authMiddleware(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
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
        const decoded = (0, jwt_1.verifyToken)(token);
        // Attach user info to request object
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
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
function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        }
        next();
    }
    catch (error) {
        // Ignore errors, continue without auth
        next();
    }
}
