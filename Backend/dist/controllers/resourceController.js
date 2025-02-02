"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResourceDetails = exports.createResource = exports.saveResource = exports.getInterviewQuestions = exports.selectArticle = exports.getArticle = exports.createArticle = exports.deleteSubjects = exports.createSubjects = exports.getResource = exports.getResources = exports.addTopic = exports.getTopics = exports.getSubjects = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = require("../utils");
const __dirname = path_1.default.resolve();
exports.getSubjects = (0, utils_1.catchAsync)(async (_req, res) => {
    const subjects = await prisma_1.default.subject.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, subjects });
});
// Topics
exports.getTopics = (0, utils_1.catchAsync)(async (req, res) => {
    const topics = await prisma_1.default.topic.findMany({
        where: { subjectId: req.params.id },
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, topics });
});
exports.addTopic = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description, subjectId } = req.body;
    const topic = await prisma_1.default.topic.create({
        data: { title, description, subjectId },
    });
    res.status(201).json({ success: true, topic });
});
// Resources
exports.getResources = (0, utils_1.catchAsync)(async (req, res) => {
    const { limit, offset, search } = req.pagination ?? {};
    const resources = await prisma_1.default.subject.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { contains: search, mode: 'insensitive' } },
                ],
            }
            : undefined,
        take: limit,
        skip: offset,
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({
        success: true,
        resources: resources.map((resource) => ({
            ...resource,
            tags: resource.tags ? JSON.parse(resource.tags) : null,
        })),
    });
});
// Resource by ID
exports.getResource = (0, utils_1.catchAsync)(async (req, res) => {
    const subjectId = req.params.id;
    const subject = await prisma_1.default.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
        return res
            .status(404)
            .json({ success: false, message: 'Subject not found' });
    }
    const topics = await prisma_1.default.topic.findMany({
        where: { subjectId },
        include: {
            articles: {
                select: { id: true, title: true, content: true, status: true },
            },
        },
    });
    res.status(200).json({
        success: true,
        resource: { subject, topics },
    });
});
// Create Subjects
exports.createSubjects = (0, utils_1.catchAsync)(async (req, res) => {
    const subjects = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid subjects array' });
    }
    const createdSubjects = await prisma_1.default.subject.createMany({ data: subjects });
    res.status(201).json({
        success: true,
        message: `Created ${createdSubjects.count} subjects successfully.`,
    });
});
// Delete Subjects
exports.deleteSubjects = (0, utils_1.catchAsync)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res
            .status(400)
            .json({ success: false, message: 'Invalid subject IDs array' });
    }
    const deletedCount = await prisma_1.default.subject.deleteMany({
        where: { id: { in: ids } },
    });
    res.status(200).json({
        success: true,
        message: `Deleted ${deletedCount.count} subjects successfully.`,
    });
});
// Articles
exports.createArticle = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, content, author, topicId } = req.body;
    const article = await prisma_1.default.article.create({
        data: {
            title,
            content,
            authorId: author,
            topicId,
        },
    });
    res.status(201).json({ success: true, article });
});
exports.getArticle = (0, utils_1.catchAsync)(async (req, res) => {
    const topicId = req.params.id;
    const articles = await prisma_1.default.article.findMany({ where: { topicId } });
    res.status(200).json({ success: true, articles });
});
exports.selectArticle = (0, utils_1.catchAsync)(async (req, res) => {
    const articleId = req.params.id;
    const article = await prisma_1.default.article.update({
        where: { id: articleId },
        data: { status: 'approved' },
    });
    res.status(200).json({ success: true, article });
});
// Interview Questions
exports.getInterviewQuestions = (0, utils_1.catchAsync)(async (_req, res) => {
    const interviewQuestionsPath = path_1.default.join(__dirname, '../../resources/interviewquestions.json');
    const data = await promises_1.default.readFile(interviewQuestionsPath, 'utf8');
    const interviewQuestions = JSON.parse(data);
    res.status(200).json({ success: true, interviewQuestions });
});
// Save Resource
exports.saveResource = (0, utils_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const article = await prisma_1.default.article.create({
        data: {
            title: `General Resource`,
            content,
            topicId: id,
            authorId: req.user.id,
            status: 'pending',
        },
    });
    res.status(201).json({
        success: true,
        message: 'Resource saved successfully. Pending approval.',
        data: article,
    });
});
exports.createResource = (0, utils_1.catchAsync)(async (_req, _res) => {
    // TODO: implement this method
});
exports.getResourceDetails = (0, utils_1.catchAsync)(async (_req, _res) => {
    // TODO: implement this method
});
//# sourceMappingURL=resourceController.js.map