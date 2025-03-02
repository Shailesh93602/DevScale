"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleVersionControl = void 0;
const client_1 = require("@prisma/client");
const transactionManager_1 = require("../../utils/transactionManager");
const prisma = new client_1.PrismaClient();
class ArticleVersionControl {
    static async createVersion(article_id, content) {
        await transactionManager_1.TransactionManager.execute(async (tx) => {
            const currentVersion = await tx.version.findFirst({
                where: { article_id: article_id },
                orderBy: { version: 'desc' },
            });
            const newVersion = currentVersion ? currentVersion.version + 1 : 1;
            await tx.version.create({
                data: {
                    article_id,
                    title: 'Version ' + newVersion,
                    content,
                    version: newVersion,
                },
            });
            await tx.article.update({
                where: { id: article_id },
                data: { content },
            });
        }, 'Create Article Version');
    }
    static async getVersionHistory(article_id) {
        return await prisma.version.findMany({
            where: { article_id: article_id },
            orderBy: { version: 'desc' },
        });
    }
    static async revertToVersion(articleId, version) {
        await transactionManager_1.TransactionManager.execute(async (tx) => {
            const targetVersion = await tx.version.findFirst({
                where: { article_id: articleId, version },
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
exports.ArticleVersionControl = ArticleVersionControl;
//# sourceMappingURL=versionControl.js.map