import { PrismaClient, Difficulty } from '@prisma/client';
import prisma from '../lib/prisma';
import logger from './logger';

export class BulkOperations {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  static async bulkCreateUsers(users: Prisma.UserCreateManyInput[]) {
    try {
      return await prisma.user.createMany({
        data: users,
        skipDuplicates: true,
      });
    } catch (error) {
      return this.handleError('bulkCreateUsers', error);
    }
  }

  static async bulkUpdateResources(
    updates: Array<{
      id: string;
      data: Prisma.ResourceUpdateInput & { difficulty?: Difficulty };
    }>
  ) {
    try {
      return await prisma.$transaction(
        updates.map(({ id, data }) =>
          prisma.resource.update({
            where: { id },
            data,
          })
        )
      );
    } catch (error) {
      return this.handleError('bulkUpdateResources', error);
    }
  }

  static async bulkDeleteChallenges(ids: string[]) {
    try {
      return await prisma.challenge.deleteMany({
        where: { id: { in: ids } },
      });
    } catch (error) {
      return this.handleError('bulkDeleteChallenges', error);
    }
  }

  private static handleError(operation: string, error: unknown) {
    logger.error(`Bulk operation ${operation} failed`, { error });
    return {
      success: false,
      message: `Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error,
    };
  }
}

// Use Prisma's generated types instead of custom types
import type { Prisma } from '@prisma/client';
