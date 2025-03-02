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
        prisma.roadmap.count({ where: { is_public: true } }),
        prisma.roadmap.count({ where: { is_public: false } }),
        prisma.contentReport.count({ where: { content_type: 'roadmap' } }),
    ]);
    return { total, active, pending, reported };
};
exports.getRoadmapStats = getRoadmapStats;
const manageRoadmap = async (roadmap_id, action) => {
    const roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmap_id },
        include: {
            topics: true,
        },
    });
    if (!roadmap)
        throw (0, errorHandler_1.createAppError)('Roadmap not found', 404);
    switch (action) {
        case 'publish':
            await prisma.roadmap.update({
                where: { id: roadmap_id },
                data: { is_public: true },
            });
            break;
        case 'unpublish':
            await prisma.roadmap.update({
                where: { id: roadmap_id },
                data: { is_public: false },
            });
            break;
        case 'delete':
            await prisma.roadmap.delete({ where: { id: roadmap_id } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`roadmap:${roadmap_id}:*`);
};
exports.manageRoadmap = manageRoadmap;
// Challenge Operations
const getChallengeStats = async () => {
    const [total, active, pending, reported] = await Promise.all([
        prisma.challenge.count(),
        prisma.challenge.count({ where: { status: 'ACTIVE' } }),
        prisma.challenge.count({ where: { status: 'PENDING' } }),
        prisma.contentReport.count({ where: { content_type: 'CHALLENGE' } }),
    ]);
    return { total, active, pending, reported };
};
exports.getChallengeStats = getChallengeStats;
const manageChallenge = async (challenge_id, action) => {
    const challenge = await prisma.challenge.findUnique({
        where: { id: challenge_id },
    });
    if (!challenge)
        throw (0, errorHandler_1.createAppError)('Challenge not found', 404);
    switch (action) {
        case 'activate':
            await prisma.challenge.update({
                where: { id: challenge_id },
                data: { status: 'ACTIVE' },
            });
            break;
        case 'deactivate':
            await prisma.challenge.update({
                where: { id: challenge_id },
                data: { status: 'ARCHIVED' },
            });
            break;
        case 'delete':
            await prisma.challenge.delete({ where: { id: challenge_id } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`challenge:${challenge_id}:*`);
};
exports.manageChallenge = manageChallenge;
// Article Operations
const getArticleStats = async () => {
    const [total, approved, pending, reported] = await Promise.all([
        prisma.article.count(),
        prisma.article.count({ where: { status: client_1.Status.APPROVED } }),
        prisma.article.count({ where: { status: 'PENDING' } }),
        prisma.contentReport.count({ where: { content_type: 'ARTICLE' } }),
    ]);
    return { total, active: approved, pending, reported };
};
exports.getArticleStats = getArticleStats;
const manageArticle = async (article_id, action) => {
    const article = await prisma.article.findUnique({
        where: { id: article_id },
    });
    if (!article)
        throw (0, errorHandler_1.createAppError)('Article not found', 404);
    switch (action) {
        case 'approve':
            await prisma.article.update({
                where: { id: article_id },
                data: { status: client_1.Status.APPROVED },
            });
            break;
        case 'reject':
            await prisma.article.update({
                where: { id: article_id },
                data: { status: client_1.Status.REJECTED },
            });
            break;
        case 'delete':
            await prisma.article.delete({ where: { id: article_id } });
            break;
        default:
            throw (0, errorHandler_1.createAppError)('Invalid action', 400);
    }
    await (0, cacheService_1.invalidateCachePattern)(`article:${article_id}:*`);
};
exports.manageArticle = manageArticle;
// Resource Allocation
const allocateResources = async (resource_type, resource_id, allocation) => {
    const model = prisma[resource_type];
    await model.update({ where: { id: resource_id }, data: allocation });
    await prisma.moderationLog.create({
        data: {
            content_id: resource_id,
            content_type: resource_type,
            action: 'resource_allocation',
            notes: JSON.stringify(allocation),
            moderator_id: allocation.moderator_id,
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
        where: { parent_id: null },
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