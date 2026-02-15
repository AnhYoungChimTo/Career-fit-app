"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.resetPassword = resetPassword;
exports.getUserById = getUserById;
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
/**
 * Register a new user
 */
async function registerUser(data) {
    const { email, password, name, securityQuestion, securityAnswer } = data;
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    // Validate password strength
    if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
    if (!/\d/.test(password)) {
        throw new Error('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        throw new Error('Password must contain at least one special character');
    }
    // Hash password and security answer
    const passwordHash = await (0, bcrypt_1.hashPassword)(password);
    const securityAnswerHash = await (0, bcrypt_1.hashSecurityAnswer)(securityAnswer);
    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name: name || null,
            securityQuestion,
            securityAnswerHash,
        },
    });
    // Generate JWT token
    const token = (0, jwt_1.generateToken)({
        userId: user.id,
        email: user.email,
    });
    // Return user DTO (without sensitive data)
    const userDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    };
    return { user: userDTO, token };
}
/**
 * Login user
 */
async function loginUser(data) {
    const { email, password } = data;
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    // Verify password
    const isPasswordValid = await (0, bcrypt_1.comparePassword)(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    // Generate JWT token
    const token = (0, jwt_1.generateToken)({
        userId: user.id,
        email: user.email,
    });
    // Return user DTO
    const userDTO = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    };
    return { user: userDTO, token };
}
/**
 * Reset password using security question
 */
async function resetPassword(data) {
    const { email, securityAnswer, newPassword } = data;
    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('User not found');
    }
    // Verify security answer
    const isAnswerValid = await (0, bcrypt_1.compareSecurityAnswer)(securityAnswer, user.securityAnswerHash);
    if (!isAnswerValid) {
        throw new Error('Incorrect security answer');
    }
    // Validate new password
    if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
    if (!/\d/.test(newPassword)) {
        throw new Error('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        throw new Error('Password must contain at least one special character');
    }
    // Hash new password
    const newPasswordHash = await (0, bcrypt_1.hashPassword)(newPassword);
    // Update password
    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
    });
    return { message: 'Password reset successfully' };
}
/**
 * Get user by ID
 */
async function getUserById(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return null;
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
    };
}
