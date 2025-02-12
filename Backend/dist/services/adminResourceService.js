"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryHierarchy = exports.manageCategories = exports.allocateResources = exports.manageArticle = exports.getArticleStats = exports.manageChallenge = exports.getChallengeStats = exports.manageRoadmap = exports.getRoadmapStats = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cacheService_1 = require("./cacheService");
const prisma = new client_1.PrismaClient();
// Roadmap Operations
const getRoadmapStats = async () => {
    const [total, active, pending, reported] = await Promise.all([
        prisma.roadmap.count(),
        prisma.roadmap.count({ where: { isPublic: true } }),
        prisma.roadmap.count({ where: { isPublic: false } }),
        prisma.contentReport.count({ where: { contentType: 'roadmap' } }),
    ]);
    return { total, active, pending, reported };
};
exports.getRoadmapStats = getRoadmapStats;
const manageRoadmap = async (roadmapId, action) => {
    const roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmapId },
        include: {
            concepts: { include: { subjects: { include: { topics: true } } } },
        },
    });
    if (!roadmap)
        throw (0, errorHandler_1.createAppError)('Roadmap not found', 404);
    switch (action) {
        case 'publish':
            await prisma.roadmap.update({
                where: { id: roadmapId },
                data: { isPublic: true },
            });
            break;
        case 'unpublish':
            await prisma.roadmap.update({
                where: { id: roadmapId },
                data: { isPublic: false },
            });
            break;
        case 'delete':
            await prisma.roadmap.delete({ where: { id: roadmapId } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`roadmap:${roadmapId}:*`);
};
exports.manageRoadmap = manageRoadmap;
// Challenge Operations
const getChallengeStats = async () => {
    const [total, active, pending, reported] = await Promise.all([
        prisma.challenge.count(),
        prisma.challenge.count({ where: { status: 'ACTIVE' } }),
        prisma.challenge.count({ where: { status: 'PENDING' } }),
        prisma.contentReport.count({ where: { contentType: 'CHALLENGE' } }),
    ]);
    return { total, active, pending, reported };
};
exports.getChallengeStats = getChallengeStats;
const manageChallenge = async (challengeId, action) => {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
    });
    if (!challenge)
        throw (0, errorHandler_1.createAppError)('Challenge not found', 404);
    switch (action) {
        case 'activate':
            await prisma.challenge.update({
                where: { id: challengeId },
                data: { status: 'ACTIVE' },
            });
            break;
        case 'deactivate':
            await prisma.challenge.update({
                where: { id: challengeId },
                data: { status: 'ARCHIVED' },
            });
            break;
        case 'delete':
            await prisma.challenge.delete({ where: { id: challengeId } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`challenge:${challengeId}:*`);
};
exports.manageChallenge = manageChallenge;
// Article Operations
const getArticleStats = async () => {
    const [total, approved, pending, reported] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: client_1.Status.APPROVED } }),
        prisma.article.count({ where: { status: 'PENDING' } }),
        prisma.contentReport.count({ where: { contentType: 'ARTICLE' } }),
    ]);
    return { total, active: approved, pending, reported };
};
exports.getArticleStats = getArticleStats;
const manageArticle = async (articleId, action) => {
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article)
        throw (0, errorHandler_1.createAppError)('Article not found', 404);
    switch (action) {
        case 'approve':
            await prisma.article.update({
                where: { id: articleId },
                data: { status: client_1.Status.APPROVED },
            });
            break;
        case 'reject':
            await prisma.article.update({
                where: { id: articleId },
                data: { status: client_1.Status.REJECTED },
            });
            break;
        case 'delete':
            await prisma.article.delete({ where: { id: articleId } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`article:${articleId}:*`);
};
exports.manageArticle = manageArticle;
// Resource Allocation
const allocateResources = async (resourceType, resourceId, allocation) => {
    const model = prisma[resourceType];
    await model.update({ where: { id: resourceId }, data: allocation });
    await prisma.moderationLog.create({
        data: {
            contentId: resourceId,
            contentType: resourceType,
            action: 'resource_allocation',
            notes: JSON.stringify(allocation),
            moderatorId: allocation.moderatorId,
        },
    });
};
exports.allocateResources = allocateResources;
// Category Management
const manageCategories = async (data, action) => {
    switch (action) {
        case 'create':
            return prisma.category.create({ data });
        case 'update':
            return prisma.category.update({ where: { name: data.name }, data });
        case 'delete':
            return prisma.category.delete({ where: { name: data.name } });
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
};
exports.manageCategories = manageCategories;
const getCategoryHierarchy = async () => {
    const categories = await prisma.category.findMany({
        include: { children: { include: { children: true } } },
        where: { parentId: null },
    });
    return buildCategoryTree(categories);
};
exports.getCategoryHierarchy = getCategoryHierarchy;
const buildCategoryTree = (categories) => {
    return categories.map((category) => ({
        ...category,
        children: category.children ? buildCategoryTree(category.children) : [],
    }));
};
//# sourceMappingURL=adminResourceService.js.map