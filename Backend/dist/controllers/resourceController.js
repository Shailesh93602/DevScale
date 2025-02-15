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
const joi_1 = __importDefault(require("joi"));
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
        where: { subject_id: req.params.id },
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, topics });
});
exports.addTopic = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description, subject_id } = req.body;
    const topic = await prisma_1.default.topic.create({
        data: { title, description, subject_id, order: 0 },
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
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
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
        })),
    });
});
// Resource by ID
exports.getResource = (0, utils_1.catchAsync)(async (req, res) => {
    const subject_id = req.params.id;
    const subject = await prisma_1.default.subject.findUnique({
        where: { id: subject_id },
    });
    if (!subject) {
        return res
            .status(404)
            .json({ success: false, message: 'Subject not found' });
    }
    const topics = await prisma_1.default.topic.findMany({
        where: { subject_id },
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
    const { title, content, author_id, topic_id } = req.body;
    const article = await prisma_1.default.article.create({
        data: {
            title,
            content,
            author_id: author_id,
            topic_id: topic_id,
        },
    });
    res.status(201).json({ success: true, article });
});
exports.getArticle = (0, utils_1.catchAsync)(async (req, res) => {
    const topic_id = req.params.id;
    const articles = await prisma_1.default.article.findMany({ where: { topic_id } });
    res.status(200).json({ success: true, articles });
});
exports.selectArticle = (0, utils_1.catchAsync)(async (req, res) => {
    const articleId = req.params.id;
    const article = await prisma_1.default.article.update({
        where: { id: articleId },
        data: { status: 'APPROVED' },
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
            topic_id: id,
            author_id: req.user.id,
            status: 'PENDING',
        },
    });
    res.status(201).json({
        success: true,
        message: 'Resource saved successfully. Pending approval.',
        data: article,
    });
});
// Resource creation validation schema
const createResourceSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    content: joi_1.default.string().required(),
    type: joi_1.default.string().required(),
    subjectId: joi_1.default.string().when('type', {
        is: 'SUBJECT',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.string().optional(),
    }),
    topicId: joi_1.default.string().when('type', {
        is: 'TOPIC',
        then: joi_1.default.string().required(),
        otherwise: joi_1.default.string().optional(),
    }),
    authorId: joi_1.default.string().required(),
    filePath: joi_1.default.string().optional(),
});
// Complete createResource controller
exports.createResource = (0, utils_1.catchAsync)(async (req, res) => {
    const { error, value } = createResourceSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    const resource = await prisma_1.default.resource.create({
        data: {
            title: value.title,
            content: value.content,
            type: value.type,
            description: value.description,
            url: value.url,
            category: value.category,
            difficulty: value.difficulty,
            created_at: value.created_at,
            updated_at: value.updated_at,
            language: value.language,
            user_id: value.user_id,
        },
    });
    res.status(201).json({
        success: true,
        data: resource,
    });
});
// Complete getResourceDetails controller
exports.getResourceDetails = (0, utils_1.catchAsync)(async (req, res) => {
    const resourceId = req.params.id;
    if (!joi_1.default.string().uuid().validate(resourceId).error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid resource ID format',
        });
    }
    const resource = await prisma_1.default.resource.findUnique({
        where: { id: resourceId },
        include: {
            articles: {
                select: {
                    id: true,
                    title: true,
                    content: true,
                    status: true,
                    created_at: true,
                },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true,
                },
            },
        },
    });
    if (!resource) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found',
        });
    }
    res.status(200).json({
        success: true,
        data: resource,
    });
});
//# sourceMappingURL=resourceController.js.map