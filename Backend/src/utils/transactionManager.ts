import { PrismaClient } from '@prisma/client';
import logger from './logger';

const prisma = new PrismaClient();

type TransactionCallback<T> = (tx: PrismaClient) => Promise<T>;

export class TransactionManager {
  static async execute<T>(
    callback: TransactionCallback<T>,
    context: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await prisma.$transaction(async (tx) => {
        return await callback(tx as PrismaClient);
      });

      logger.info(`Transaction completed: ${context}`, {
        duration: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      logger.error(`Transaction failed: ${context}`, {
        error,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  static async executeWithRetry<T>(
    callback: TransactionCallback<T>,
    context: string,
    maxRetries = 3
  ): Promise<T> {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        return await this.execute(callback, context);
      } catch (error) {
        attempts++;
        if (attempts === maxRetries) throw error;

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempts) * 1000)
        );
      }
    }

    throw new Error('Max retry attempts reached');
  }
}
