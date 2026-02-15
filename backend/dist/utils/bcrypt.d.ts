/**
 * Hash a password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare a plain text password with a hashed password
 */
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
/**
 * Hash a security answer (for password reset)
 */
export declare function hashSecurityAnswer(answer: string): Promise<string>;
/**
 * Compare a security answer
 */
export declare function compareSecurityAnswer(answer: string, hashedAnswer: string): Promise<boolean>;
//# sourceMappingURL=bcrypt.d.ts.map