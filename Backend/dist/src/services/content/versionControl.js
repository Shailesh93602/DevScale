"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleVersionControl = void 0;
const transactionManager_1 = require("../../utils/transactionManager");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class ArticleVersionControl {
    static async createVersion(article_id, content) {
        await transactionManager_1.TransactionManager.transaction(async (tx) => {
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
        }, { maxRetries: 3, timeout: 5000 });
    }
    static async getVersionHistory(article_id) {
        return await prisma_1.default.version.findMany({
            where: { article_id: article_id },
            orderBy: { version: 'desc' },
        });
    }
    static async revertToVersion(articleId, version) {
        await transactionManager_1.TransactionManager.transaction(async (tx) => {
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
        }, { maxRetries: 3, timeout: 5000 });
    }
}
exports.ArticleVersionControl = ArticleVersionControl;
//# sourceMappingURL=versionControl.js.map