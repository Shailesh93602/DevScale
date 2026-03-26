import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? new PrismaClient();

// Enable slow query logging
prisma.$use(async (params, next) => {
  const start = Date.now();
  const result = await next(params);
  const duration = Date.now() - start;

  if (duration > 100) {
    logger.warn('Slow query detected:', {
      model: params.model,
      action: params.action,
      duration,
      args: params.args,
    });
  }

  return result;
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
