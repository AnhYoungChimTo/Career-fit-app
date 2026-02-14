import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Hash a security answer (for password reset)
 */
export async function hashSecurityAnswer(answer: string): Promise<string> {
  // Normalize answer: lowercase and trim
  const normalized = answer.toLowerCase().trim();
  return hashPassword(normalized);
}

/**
 * Compare a security answer
 */
export async function compareSecurityAnswer(
  answer: string,
  hashedAnswer: string
): Promise<boolean> {
  const normalized = answer.toLowerCase().trim();
  return comparePassword(normalized, hashedAnswer);
}
