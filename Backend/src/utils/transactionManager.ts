import { PrismaClient } from '@prisma/client';
import logger from './logger';
import prisma from '../lib/prisma';

type TransactionCallback<T> = (
  tx: Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >
) => Promise<T>;

export class TransactionManager {
  static async transaction<T>(
    callback: TransactionCallback<T>,
    options?: { maxRetries?: number; timeout?: number }
  ): Promise<T> {
    const maxRetries = options?.maxRetries || 3;
    const timeout = options?.timeout || 5000;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const result = await Promise.race([
          prisma.$transaction(callback),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Transaction timeout')), timeout)
          ),
        ]);
        return result as T;
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          logger.error('Transaction failed after max retries:', error);
          throw error;
        }
        logger.warn(
          `Transaction attempt ${attempt} failed, retrying...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('Transaction failed');
  }
}
