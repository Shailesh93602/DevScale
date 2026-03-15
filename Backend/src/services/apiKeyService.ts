import { createAppError } from '../utils/errorHandler';
import crypto from 'crypto';
import logger from '../utils/logger';

import prisma from '../lib/prisma';

export const generateApiKey = async (
  user_id: string,
  scope: string[] = ['read']
): Promise<string> => {
  const apiKey = crypto.randomBytes(32).toString('hex');
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

  await prisma.apiKey.create({
    data: {
      user_id,
      key: hashedKey,
      scope,
      last_used: new Date(),
    },
  });

  logger.info(`API key generated for user ${user_id}`);
  return apiKey;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  const key = await prisma.apiKey.findUnique({
    where: { key: hashedKey },
  });

  if (!key) return false;

  await prisma.apiKey.update({
    where: { id: key.id },
    data: { last_used: new Date() },
  });
  return true;
};

export const revokeApiKey = async (apiKey: string): Promise<void> => {
  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
  await prisma.apiKey.delete({ where: { key: hashedKey } });
  logger.info('API key revoked');
};

export class ApiKeyService {
  static async validateApiKey(key: string): Promise<boolean> {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      select: {
        id: true,
        expires_at: true,
      },
    });

    if (!apiKey || (apiKey.expires_at && apiKey.expires_at < new Date())) {
      throw createAppError('Invalid or expired API key', 401);
    }

    return true;
  }

  static async createApiKey(userId: string): Promise<string> {
    const key = crypto.randomBytes(32).toString('hex');
    await prisma.apiKey.create({
      data: {
        key,
        user_id: userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
    return key;
  }

  static async deactivateApiKey(key: string): Promise<void> {
    await prisma.apiKey.update({
      where: { key },
      data: {
        expires_at: new Date(),
      },
    });
  }
}
