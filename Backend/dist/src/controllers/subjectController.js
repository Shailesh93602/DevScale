"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicsInSubject = exports.getAllSubjects = void 0;
const index_1 = require("../utils/index");
const apiResponse_1 = require("../utils/apiResponse");
const topicService_1 = require("../services/topicService");
const pagination_1 = require("../utils/pagination");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.getAllSubjects = (0, index_1.catchAsync)(async (req, res) => {
    const params = (0, pagination_1.parsePaginationQuery)(req.query);
    // Add your custom validations here if needed
    if (params.page < 1) {
        return res.status(400).json({ error: 'Invalid page number' });
    }
    // Execute pagination
    const subjects = await (0, pagination_1.paginate)(prisma.subject, params, ['title', 'description']);
    return (0, apiResponse_1.sendResponse)(res, 'SUBJECTS_FETCHED', { data: subjects });
});
exports.getTopicsInSubject = (0, index_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const topics = await (0, topicService_1.getTopicsBySubjectId)(id);
    if (topics) {
        return (0, apiResponse_1.sendResponse)(res, 'TOPICS_FETCHED', { data: topics });
    }
    return (0, apiResponse_1.sendResponse)(res, 'TOPICS_NOT_FOUND');
});
//# sourceMappingURL=subjectController.js.map