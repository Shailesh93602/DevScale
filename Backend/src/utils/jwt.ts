import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/config';
import { createAppError } from './createAppError';

export const verifyToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    throw createAppError('Invalid token', 401);
  }
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};
