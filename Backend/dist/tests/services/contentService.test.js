"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_1 = require("../setup");
const contentService_1 = require("../../services/contentService");
let mockCtx;
beforeEach(() => {
    mockCtx = (0, setup_1.createMockContext)();
});
describe('ContentService', () => {
    describe('createArticle', () => {
        const articleData = {
            title: 'Test Article',
            content: 'Test Content',
            authorId: 'user1',
            topicId: 'topic1',
        };
        it('should create a new article', async () => {
            const mockArticle = { id: 'article1', ...articleData };
            mockCtx.prisma.article.create.mockResolvedValue(mockArticle);
            const result = await contentService_1.ContentService.createArticle(articleData);
            expect(result).toHaveProperty('id');
            expect(result.title).toBe(articleData.title);
        });
        it('should create article version on creation', async () => {
            const mockArticle = { id: 'article1', ...articleData };
            mockCtx.prisma.article.create.mockResolvedValue(mockArticle);
            mockCtx.prisma.articleVersion.create.mockResolvedValue({
                id: 'version1',
                articleId: 'article1',
                version: 1,
            });
            const result = await contentService_1.ContentService.createArticle(articleData);
            expect(result).toHaveProperty('currentVersion');
        });
    });
    describe('moderateContent', () => {
        const moderationData = {
            contentId: 'article1',
            moderatorId: 'mod1',
            status: 'approved',
            notes: 'Content looks good',
        };
        it('should update content moderation status', async () => {
            mockCtx.prisma.article.update.mockResolvedValue({
                id: 'article1',
                status: 'approved',
            });
            const result = await contentService_1.ContentService.moderateContent(moderationData);
            expect(result.status).toBe('approved');
        });
        it('should create moderation log', async () => {
            mockCtx.prisma.article.update.mockResolvedValue({
                id: 'article1',
                status: 'approved',
            });
            mockCtx.prisma.moderationLog.create.mockResolvedValue({
                id: 'log1',
                ...moderationData,
            });
            await contentService_1.ContentService.moderateContent(moderationData);
            expect(mockCtx.prisma.moderationLog.create).toHaveBeenCalled();
        });
    });
    describe('getContentHistory', () => {
        it('should return content version history', async () => {
            const mockVersions = [
                { id: 'v1', version: 1, createdAt: new Date('2023-01-01') },
                { id: 'v2', version: 2, createdAt: new Date('2023-01-02') },
            ];
            mockCtx.prisma.articleVersion.findMany.mockResolvedValue(mockVersions);
            const result = await contentService_1.ContentService.getContentHistory('article1');
            expect(result).toHaveLength(2);
            expect(result[0].version).toBeLessThan(result[1].version);
        });
    });
});
//# sourceMappingURL=contentService.test.js.map