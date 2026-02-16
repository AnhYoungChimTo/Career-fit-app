import { PrismaClient, User } from '@prisma/client';
import { hashPassword, comparePassword, hashSecurityAnswer, compareSecurityAnswer } from '../utils/bcrypt';
import { generateToken, JWTPayload } from '../utils/jwt';
import { RegisterRequest, LoginRequest, PasswordResetRequest, UserDTO } from '../types';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function registerUser(data: RegisterRequest): Promise<{ user: UserDTO; token: string }> {
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
  const passwordHash = await hashPassword(password);
  const securityAnswerHash = await hashSecurityAnswer(securityAnswer);

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
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Return user DTO (without sensitive data)
  const userDTO: UserDTO = {
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
export async function loginUser(data: LoginRequest): Promise<{ user: UserDTO; token: string }> {
  const { email, password } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Return user DTO
  const userDTO: UserDTO = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };

  return { user: userDTO, token };
}

/**
 * Get security question by email
 */
export async function getSecurityQuestion(email: string): Promise<{ securityQuestion: string }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return { securityQuestion: user.securityQuestion };
}

/**
 * Verify security answer
 */
export async function verifySecurityAnswer(email: string, securityAnswer: string): Promise<{ verified: boolean }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify security answer
  const isAnswerValid = await compareSecurityAnswer(securityAnswer, user.securityAnswerHash);

  if (!isAnswerValid) {
    throw new Error('Incorrect security answer');
  }

  return { verified: true };
}

/**
 * Reset password using security question
 */
export async function resetPassword(data: PasswordResetRequest): Promise<{ message: string }> {
  const { email, securityAnswer, newPassword } = data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify security answer
  const isAnswerValid = await compareSecurityAnswer(securityAnswer, user.securityAnswerHash);

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
  const newPasswordHash = await hashPassword(newPassword);

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
export async function getUserById(userId: string): Promise<UserDTO | null> {
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
    headline: (user as any).headline,
    location: (user as any).location,
    phoneNumber: (user as any).phoneNumber,
    linkedinUrl: (user as any).linkedinUrl,
    about: (user as any).about,
    currentRole: (user as any).currentRole,
    currentCompany: (user as any).currentCompany,
  };
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
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
  const newPasswordHash = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { message: 'Password changed successfully' };
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<{
  name: string;
  headline: string;
  location: string;
  phoneNumber: string;
  linkedinUrl: string;
  about: string;
  currentRole: string;
  currentCompany: string;
}>): Promise<UserDTO> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updates as any,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    headline: (user as any).headline,
    location: (user as any).location,
    phoneNumber: (user as any).phoneNumber,
    linkedinUrl: (user as any).linkedinUrl,
    about: (user as any).about,
    currentRole: (user as any).currentRole,
    currentCompany: (user as any).currentCompany,
  };
}
