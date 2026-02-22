"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getSecurityQuestion = getSecurityQuestion;
exports.verifySecurityAnswer = verifySecurityAnswer;
exports.resetPassword = resetPassword;
exports.getCurrentUser = getCurrentUser;
exports.changePassword = changePassword;
exports.updateProfile = updateProfile;
exports.logout = logout;
const authService = __importStar(require("../services/auth.service"));
/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const data = req.body;
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
    }
    catch (error) {
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
async function login(req, res) {
    try {
        const data = req.body;
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
    }
    catch (error) {
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
async function getSecurityQuestion(req, res) {
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
    }
    catch (error) {
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
async function verifySecurityAnswer(req, res) {
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
    }
    catch (error) {
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
async function resetPassword(req, res) {
    try {
        const data = req.body;
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
    }
    catch (error) {
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
async function getCurrentUser(req, res) {
    try {
        // User ID is attached by auth middleware
        const userId = req.userId;
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
    }
    catch (error) {
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
async function changePassword(req, res) {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
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
async function updateProfile(req, res) {
    try {
        const userId = req.userId;
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
    }
    catch (error) {
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
async function logout(req, res) {
    res.status(200).json({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.',
    });
}
