"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArticleComments = exports.getMyArticles = exports.updateModerationNotes = exports.getArticleById = exports.updateArticleContent = exports.updateArticleStatus = exports.getArticles = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
exports.getArticles = (0, utils_1.catchAsync)(async (req, res) => {
    const { status, search } = req.query;
    const whereCondition = {};
    if (status) {
        whereCondition.status = status;
    }
    if (search) {
        whereCondition.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ];
    }
    const articles = await prisma.article.findMany({
        where: whereCondition,
        include: {
            author: {
                select: { username: true },
            },
        },
        orderBy: { created_at: 'desc' },
    });
    res.status(200).json({
        success: true,
        message: 'Articles fetched successfully',
        articles,
    });
});
exports.updateArticleStatus = (0, utils_1.catchAsync)(async (req, res) => {
    const { id, status } = req.query;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    const article = await prisma.article.findUnique({
        where: { id },
    });
    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }
    const updatedArticle = await prisma.article.update({
        where: { id },
        data: { status },
    });
    res
        .status(200)
        .json({ message: 'Article status updated successfully', updatedArticle });
});
exports.updateArticleContent = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
        return res
            .status(400)
            .json({ error: 'Please provide title or content to update' });
    }
    const article = await prisma.article.findUnique({
        where: { id },
    });
    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }
    const updatedArticle = await prisma.article.update({
        where: { id },
        data: { title, content },
    });
    res.status(200).json({
        success: true,
        message: 'Article content updated successfully',
        updatedArticle,
    });
});
exports.getArticleById = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
        where: { id },
        include: {
            author: {
                select: { username: true },
            },
        },
    });
    if (!article) {
        return res
            .status(404)
            .json({ success: false, message: 'Article not found.' });
    }
    res.status(200).json({ success: true, article });
});
exports.updateModerationNotes = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { moderationNotes } = req.body;
    const article = await prisma.article.findUnique({
        where: { id },
    });
    if (!article) {
        return res.status(404).json({
            success: false,
            message: 'Article not found',
        });
    }
    const updatedArticle = await prisma.article.update({
        where: { id },
        data: { moderationNotes },
    });
    res.status(200).json({
        success: true,
        message: 'Moderation notes updated successfully',
        updatedArticle,
    });
});
exports.getMyArticles = (0, utils_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    const articles = await prisma.article.findMany({
        where: { authorId: userId },
        select: { id: true, title: true, status: true },
        orderBy: { created_at: 'desc' },
    });
    res.status(200).json({
        success: true,
        message: 'Articles retrieved successfully',
        articles,
    });
});
exports.getArticleComments = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
        where: { id },
        select: { id: true, moderationNotes: true },
    });
    if (!article) {
        return res.status(404).json({
            success: false,
            message: 'Article not found',
        });
    }
    res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        comments: article.moderationNotes,
    });
});
//# sourceMappingURL=articleController.js.map