"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateArticle = exports.deleteArticle = exports.getArticles = exports.getArticle = exports.updateArticle = exports.createArticle = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const cloudinary_1 = require("../utils/cloudinary");
const prisma = new client_1.PrismaClient();
const createArticle = async (data) => {
    const processedContent = await processArticleContent(data.content, data.images);
    return prisma.article.create({
        data: {
            title: data.title,
            content: processedContent,
            authorId: data.authorId,
            topicId: data.topicId,
            resourceId: data.resourceId,
            status: data.status ?? client_1.Status.PENDING,
            moderationNotes: data.moderationNotes,
        },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
    });
};
exports.createArticle = createArticle;
const updateArticle = async (id, data) => {
    let processedContent = data.content;
    if (data.content && data.images) {
        processedContent = await processArticleContent(data.content, data.images);
    }
    return prisma.article.update({
        where: { id },
        data: { ...data, content: processedContent },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
    });
};
exports.updateArticle = updateArticle;
const getArticle = async (id) => {
    const article = await prisma.article.findUnique({
        where: { id },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
            resource: true,
        },
    });
    if (!article)
        throw (0, errorHandler_1.createAppError)('Article not found', 404);
    return article;
};
exports.getArticle = getArticle;
const getArticles = async (filters) => {
    return prisma.article.findMany({
        where: {
            topicId: filters?.topicId,
            authorId: filters?.authorId,
            status: filters?.status,
            title: filters?.search
                ? { contains: filters.search, mode: 'insensitive' }
                : undefined,
        },
        include: {
            author: { select: { username: true, avatar_url: true } },
            topic: true,
        },
        orderBy: { created_at: 'desc' },
    });
};
exports.getArticles = getArticles;
const deleteArticle = async (id) => {
    await prisma.article.delete({ where: { id } });
};
exports.deleteArticle = deleteArticle;
const moderateArticle = async (id, status, moderationNotes) => {
    return prisma.article.update({
        where: { id },
        data: { status, moderationNotes },
    });
};
exports.moderateArticle = moderateArticle;
const processArticleContent = async (content, images) => {
    if (!images?.length)
        return content;
    let processedContent = content;
    for (const image of images) {
        const imageUrl = await (0, cloudinary_1.uploadToCloudinary)(image, 'articles');
        processedContent = processedContent.replace(`[image:${image.originalname}]`, `![${image.originalname}](${imageUrl})`);
    }
    return processedContent;
};
//# sourceMappingURL=articleService.js.map