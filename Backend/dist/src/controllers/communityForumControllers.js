"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteForum = exports.updateForum = exports.createForum = exports.getForum = exports.getForums = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const prisma = new client_1.PrismaClient();
exports.getForums = (0, utils_1.catchAsync)(async (req, res) => {
    const forums = await prisma.forum.findMany({
        orderBy: { created_at: 'asc' },
    });
    return (0, apiResponse_1.sendResponse)(res, 'FORUMS_FETCHED', { data: forums });
});
exports.getForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
    });
    if (!forum) {
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
    }
    return (0, apiResponse_1.sendResponse)(res, 'FORUM_FETCHED', { data: forum });
});
exports.createForum = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
    }
    const forum = await prisma.forum.create({
        data: {
            title,
            description,
            created_by: req.user.id,
        },
    });
    return (0, apiResponse_1.sendResponse)(res, 'FORUM_CREATED', { data: forum });
});
exports.updateForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const { title, description } = req.body;
    if (!title || !description) {
        return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
    }
    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
    });
    if (!forum) {
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
    }
    const updatedForum = await prisma.forum.update({
        where: { id: forumId },
        data: { title, description },
    });
    return (0, apiResponse_1.sendResponse)(res, 'FORUM_UPDATED', { data: updatedForum });
});
exports.deleteForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
    });
    if (!forum) {
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
    }
    await prisma.forum.delete({
        where: { id: forumId },
    });
    return (0, apiResponse_1.sendResponse)(res, 'FORUM_DELETED');
});
//# sourceMappingURL=communityForumControllers.js.map