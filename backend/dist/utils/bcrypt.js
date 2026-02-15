"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.hashSecurityAnswer = hashSecurityAnswer;
exports.compareSecurityAnswer = compareSecurityAnswer;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
}
/**
 * Compare a plain text password with a hashed password
 */
async function comparePassword(password, hashedPassword) {
    return bcrypt_1.default.compare(password, hashedPassword);
}
/**
 * Hash a security answer (for password reset)
 */
async function hashSecurityAnswer(answer) {
    // Normalize answer: lowercase and trim
    const normalized = answer.toLowerCase().trim();
    return hashPassword(normalized);
}
/**
 * Compare a security answer
 */
async function compareSecurityAnswer(answer, hashedAnswer) {
    const normalized = answer.toLowerCase().trim();
    return comparePassword(normalized, hashedAnswer);
}
