import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import logger from '../utils/logger';

const prisma = new PrismaClient();

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
  const key = await prisma.apiKey.findUnique({ where: { key: hashedKey } });

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
