import crypto from 'crypto';
import bcrypt from 'bcrypt';
import logger from './logger';
import { createAppError } from './errorHandler';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePasswords = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const sanitizeHtml = (input: string): string => {
  const entities = new Map([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
  ]);

  return input.replace(/[&<>"']/g, (char) => entities.get(char) || char).trim();
};

export const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const performSecurityAudit = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'test') return;

    const securityConfig = {
      helmet: process.env.USE_HELMET === 'true',
      csrf: process.env.CSRF_PROTECTION === 'true',
      rateLimit: process.env.RATE_LIMIT === 'true',
      secureHeaders: process.env.SECURE_HEADERS === 'true',
      xssProtection: process.env.XSS_PROTECTION === 'true',
    };

    const missingProtections = Object.entries(securityConfig)
      .filter(([, enabled]) => !enabled)
      .map(([protection]) => protection);

    if (missingProtections.length > 0) {
      logger.warn('Security protections missing:', missingProtections);
    }
  } catch (error) {
    logger.error('Security audit failed:', error);
    throw createAppError('Security audit failed', 500, { auditError: true });
  }
};
