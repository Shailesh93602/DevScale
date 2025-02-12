import { PrismaClient } from '@prisma/client';
import { TransactionManager } from '../../utils/transactionManager';

const prisma = new PrismaClient();

export class ArticleVersionControl {
  static async createVersion(
    articleId: string,
    content: string
  ): Promise<void> {
    await TransactionManager.execute(async (tx) => {
      const currentVersion = await tx.version.findFirst({
        where: { articleId },
        orderBy: { version: 'desc' },
      });

      const newVersion = currentVersion ? currentVersion.version + 1 : 1;

      await tx.version.create({
        data: {
          articleId,
          title: 'Version ' + newVersion,
          content,
          version: newVersion,
        },
      });

      await tx.article.update({
        where: { id: articleId },
        data: { content },
      });
    }, 'Create Article Version');
  }

  static async getVersionHistory(articleId: string) {
    return await prisma.version.findMany({
      where: { articleId },
      orderBy: { version: 'desc' },
    });
  }

  static async revertToVersion(articleId: string, version: number) {
    await TransactionManager.execute(async (tx) => {
      const targetVersion = await tx.version.findFirst({
        where: { articleId, version },
      });

      if (!targetVersion) {
        throw new Error('Version not found');
      }

      await tx.article.update({
        where: { id: articleId },
        data: { content: targetVersion.content },
      });

      await this.createVersion(articleId, targetVersion.content);
    }, 'Revert Article Version');
  }
}
