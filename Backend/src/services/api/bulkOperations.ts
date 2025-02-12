import { PrismaClient } from '@prisma/client';
import type { Prisma, User, Roadmap, Topic } from '@prisma/client';

const prisma = new PrismaClient();

export class BulkOperationsService {
  static async bulkCreateUsers(users: Prisma.UserCreateInput[]) {
    return this.executeBulkOperation<User>(
      users,
      async (userData, tx) => {
        return tx.user.create({ data: userData });
      },
      {
        batchSize: 50,
        context: 'Bulk User Creation',
      }
    );
  }

  static async bulkUpdateRoadmaps(
    updates: Array<{
      id: string;
      data: Prisma.RoadmapUpdateInput;
    }>
  ) {
    return this.executeBulkOperation<Roadmap>(
      updates,
      async (update, tx) => {
        return tx.roadmap.update({
          where: { id: update.id },
          data: update.data,
        });
      },
      {
        batchSize: 25,
        context: 'Bulk Roadmap Update',
      }
    );
  }

  static async bulkDeleteTopics(topicIds: string[]) {
    return this.executeBulkOperation<Topic>(
      topicIds,
      async (id, tx) => {
        return tx.topic.delete({
          where: { id },
        });
      },
      {
        batchSize: 10,
        continueOnError: true,
        context: 'Bulk Topic Deletion',
      }
    );
  }

  private static async executeBulkOperation<T>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operation: (item: any, tx: Prisma.TransactionClient) => Promise<T>,
    config: {
      batchSize: number;
      context: string;
      continueOnError?: boolean;
    }
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < items.length; i += config.batchSize) {
      const batch = items.slice(i, i + config.batchSize);

      try {
        const batchResults = await prisma.$transaction(async (tx) => {
          const batchPromises = batch.map((item) =>
            operation(item, tx).catch((error) => {
              if (config.continueOnError) {
                console.error(`${config.context} error:`, error);
                return null;
              }
              throw error;
            })
          );
          return Promise.all(batchPromises);
        });

        results.push(...(batchResults.filter(Boolean) as T[]));
      } catch (error) {
        console.error(
          `${config.context} failed at batch ${i / config.batchSize}:`,
          error
        );
        if (!config.continueOnError) throw error;
      }
    }

    return results;
  }
}
