"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma_1 = __importDefault(require("../prisma"));
const utils_1 = require("../utils");
const joi_1 = __importDefault(require("joi"));
const apiResponse_1 = require("@/utils/apiResponse");
const errorHandler_1 = require("@/utils/errorHandler");
const __dirname = path_1.default.resolve();
class ResourceController {
    getSubjects = (0, utils_1.catchAsync)(async (_req, res) => {
        const subjects = await prisma_1.default.subject.findMany({
            orderBy: { created_at: 'asc' },
        });
        (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_FETCHED', { data: { subjects } });
    });
    // Topics
    getTopics = (0, utils_1.catchAsync)(async (req, res) => {
        const topics = await prisma_1.default.topic.findMany({
            where: {
                subjects: {
                    some: {
                        id: req.params.id,
                    },
                },
            },
            orderBy: { created_at: 'asc' },
        });
        (0, apiResponse_1.sendResponse)(res, 'TOPICS_FETCHED', { data: { topics } });
    });
    addTopic = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, description, subject_id } = req.body;
        const topic = await prisma_1.default.topic.create({
            data: {
                title,
                description,
                subjects: {
                    connect: { id: subject_id },
                },
                order: 0,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'TOPIC_ADDED', { data: { topic } });
    });
    // Resources
    getResources = (0, utils_1.catchAsync)(async (req, res) => {
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
        (0, apiResponse_1.sendResponse)(res, 'RESOURCES_FETCHED', { data: { resources } });
    });
    // Resource by ID
    getResource = (0, utils_1.catchAsync)(async (req, res) => {
        const subject_id = req.params.id;
        const subject = await prisma_1.default.subject.findUnique({
            where: { id: subject_id },
        });
        if (!subject) {
            throw (0, errorHandler_1.createAppError)('Subject not found', 404);
        }
        const topics = await prisma_1.default.topic.findMany({
            where: {
                subjects: {
                    some: {
                        id: subject_id,
                    },
                },
            },
            include: {
                articles: {
                    select: { id: true, title: true, content: true, status: true },
                },
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'RESOURCE_FETCHED', { data: { subject, topics } });
    });
    // Create Subjects
    createSubjects = (0, utils_1.catchAsync)(async (req, res) => {
        const subjects = req.body;
        if (!Array.isArray(subjects) || subjects.length === 0) {
            throw (0, errorHandler_1.createAppError)('Invalid subjects array', 400);
        }
        const createdSubjects = await prisma_1.default.subject.createMany({ data: subjects });
        (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_CREATED', {
            data: { subjects: createdSubjects },
        });
    });
    // Delete Subjects
    deleteSubjects = (0, utils_1.catchAsync)(async (req, res) => {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            throw (0, errorHandler_1.createAppError)('Invalid subject IDs array', 400);
        }
        await prisma_1.default.subject.deleteMany({
            where: { id: { in: ids } },
        });
        (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_DELETED');
    });
    // Articles
    createArticle = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, content, author_id, topic_id } = req.body;
        const article = await prisma_1.default.article.create({
            data: {
                title,
                content,
                author_id: author_id,
                topic_id: topic_id,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'ARTICLE_CREATED', { data: { article } });
    });
    getArticle = (0, utils_1.catchAsync)(async (req, res) => {
        const topic_id = req.params.id;
        const articles = await prisma_1.default.article.findMany({ where: { topic_id } });
        (0, apiResponse_1.sendResponse)(res, 'ARTICLES_FETCHED', { data: { articles } });
    });
    selectArticle = (0, utils_1.catchAsync)(async (req, res) => {
        const articleId = req.params.id;
        const article = await prisma_1.default.article.update({
            where: { id: articleId },
            data: { status: 'APPROVED' },
        });
        (0, apiResponse_1.sendResponse)(res, 'ARTICLE_UPDATED', { data: { articles: article } });
    });
    // Interview Questions
    getInterviewQuestions = (0, utils_1.catchAsync)(async (_req, res) => {
        const interviewQuestionsPath = path_1.default.join(__dirname, '../../resources/interviewquestions.json');
        const data = await promises_1.default.readFile(interviewQuestionsPath, 'utf8');
        const interviewQuestions = JSON.parse(data);
        (0, apiResponse_1.sendResponse)(res, 'INTERVIEW_QUESTIONS_FETCHED', {
            data: { interviewQuestions },
        });
    });
    // Save Resource
    saveResource = (0, utils_1.catchAsync)(async (req, res) => {
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
        (0, apiResponse_1.sendResponse)(res, 'RESOURCE_CREATED', { data: { article } });
    });
    // Resource creation validation schema
    createResourceSchema = joi_1.default.object({
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
    createResource = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, content, type, description, url, category, difficulty, language, } = req.body;
        const resource = await prisma_1.default.resource.create({
            data: {
                title,
                content,
                type,
                description,
                url,
                category,
                difficulty,
                language,
                user_id: req?.user?.id,
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'RESOURCE_CREATED', { data: resource });
    });
    // Complete getResourceDetails controller
    getResourceDetails = (0, utils_1.catchAsync)(async (req, res) => {
        const resourceId = req.params.id;
        if (!joi_1.default.string().uuid().validate(resourceId).error) {
            throw (0, errorHandler_1.createAppError)('Invalid resource ID format', 400);
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
            throw (0, errorHandler_1.createAppError)('Resource not found', 404);
        }
        (0, apiResponse_1.sendResponse)(res, 'RESOURCE_DETAILS_FETCHED', { data: resource });
    });
}
exports.default = ResourceController;
//# sourceMappingURL=resourceController.js.map