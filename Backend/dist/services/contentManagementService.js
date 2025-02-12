"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateArticle = exports.getArticleVersions = exports.getPendingArticles = exports.getArticlesByTopic = exports.reviewArticle = exports.submitArticle = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cloudinary_1 = require("../utils/cloudinary");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const submitArticle = async (data) => {
    let processedContent = data.content;
    if (data.images?.length) {
        processedContent = await processArticleImages(data.content, data.images);
    }
    const article = await prisma.article.create({
        data: {
            title: data.title,
            content: processedContent,
            authorId: data.authorId,
            topicId: data.topicId,
            status: client_1.Status.PENDING,
        },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
    });
    await trackSubmission(data.authorId, article.id);
    return article;
};
exports.submitArticle = submitArticle;
const reviewArticle = async (data) => {
    const article = await prisma.article.update({
        where: { id: data.articleId },
        data: { status: data.status, moderationNotes: data.moderationNotes },
        include: { author: { select: { username: true, email: true } } },
    });
    await notifyAuthor(article);
    return article;
};
exports.reviewArticle = reviewArticle;
const getArticlesByTopic = async (topicId) => {
    return prisma.article.findMany({
        where: { topicId, status: client_1.Status.APPROVED },
        include: {
            author: { select: { username: true, avatar_url: true } },
            _count: { select: { likes: true, comments: true } },
        },
        orderBy: { created_at: 'desc' },
    });
};
exports.getArticlesByTopic = getArticlesByTopic;
const getPendingArticles = async () => {
    return prisma.article.findMany({
        where: { status: client_1.Status.PENDING },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
        orderBy: { created_at: 'asc' },
    });
};
exports.getPendingArticles = getPendingArticles;
const getArticleVersions = async (articleId) => {
    return prisma.articleVersion.findMany({
        where: { articleId },
        orderBy: { version: 'desc' },
    });
};
exports.getArticleVersions = getArticleVersions;
const updateArticle = async (id, data) => {
    const currentArticle = await prisma.article.findUnique({ where: { id } });
    if (!currentArticle)
        throw (0, errorHandler_1.createAppError)('Article not found', 404);
    await prisma.articleVersion.create({
        data: {
            articleId: id,
            content: currentArticle.content,
            title: currentArticle.title,
            version: (await getLatestVersion(id)) + 1,
        },
    });
    let processedContent = data.content;
    if (data.images?.length) {
        processedContent = await processArticleImages(data.content ?? currentArticle.content, data.images);
    }
    return prisma.article.update({
        where: { id },
        data: {
            title: data.title,
            content: processedContent,
            status: client_1.Status.PENDING,
        },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
    });
};
exports.updateArticle = updateArticle;
// Helper functions
const processArticleImages = async (content, images) => {
    let processedContent = content;
    for (const image of images) {
        const imageUrl = await (0, cloudinary_1.uploadToCloudinary)(image, 'articles');
        processedContent = processedContent.replace(`[image:${image.originalname}]`, `![${image.originalname}](${imageUrl})`);
    }
    return processedContent;
};
const getLatestVersion = async (articleId) => {
    const latestVersion = await prisma.articleVersion.findFirst({
        where: { articleId },
        orderBy: { version: 'desc' },
    });
    return latestVersion?.version ?? 0;
};
const trackSubmission = async (authorId, articleId) => {
    try {
        await prisma.submissionLog.create({
            data: { authorId, articleId, type: 'article' },
        });
    }
    catch (error) {
        logger_1.default.error('Error tracking submission:', error);
    }
};
const notifyAuthor = async (article) => {
    try {
        await prisma.notification.create({
            data: {
                userId: article.authorId,
                title: 'Article Review Update',
                message: `Your article "${article.title}" has been ${article.status}`,
                type: 'system',
                link: `/articles/${article.id}`,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Error notifying author:', error);
    }
};
//# sourceMappingURL=contentManagementService.js.map