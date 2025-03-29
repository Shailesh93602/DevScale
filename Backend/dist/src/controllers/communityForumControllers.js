"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("../utils/apiResponse");
const forumRepository_1 = require("@/repositories/forumRepository");
class CommunityForumController {
    forumRepo;
    constructor() {
        this.forumRepo = new forumRepository_1.ForumRepository();
    }
    getForums = (0, utils_1.catchAsync)(async (req, res) => {
        const forums = await this.forumRepo.findMany({
            orderBy: { created_at: 'asc' },
        });
        return (0, apiResponse_1.sendResponse)(res, 'FORUMS_FETCHED', { data: forums });
    });
    getForum = (0, utils_1.catchAsync)(async (req, res) => {
        const forumId = req.params.id;
        const forum = await this.forumRepo.findUnique({
            where: { id: forumId },
        });
        if (!forum) {
            return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
        }
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_FETCHED', { data: forum });
    });
    createForum = (0, utils_1.catchAsync)(async (req, res) => {
        const { title, description } = req.body;
        if (!title || !description) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
        }
        const forum = await this.forumRepo.create({
            data: {
                title,
                description,
                created_by: req.user.id,
            },
        });
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_CREATED', { data: forum });
    });
    updateForum = (0, utils_1.catchAsync)(async (req, res) => {
        const forumId = req.params.id;
        const { title, description } = req.body;
        if (!title || !description) {
            return (0, apiResponse_1.sendResponse)(res, 'INVALID_PAYLOAD');
        }
        const forum = await this.forumRepo.findUnique({
            where: { id: forumId },
        });
        if (!forum) {
            return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
        }
        const updatedForum = await this.forumRepo.update({
            where: { id: forumId },
            data: { title, description },
        });
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_UPDATED', { data: updatedForum });
    });
    deleteForum = (0, utils_1.catchAsync)(async (req, res) => {
        const forumId = req.params.id;
        const forum = await this.forumRepo.findUnique({
            where: { id: forumId },
        });
        if (!forum) {
            return (0, apiResponse_1.sendResponse)(res, 'FORUM_NOT_FOUND');
        }
        await this.forumRepo.delete({
            where: { id: forumId },
        });
        return (0, apiResponse_1.sendResponse)(res, 'FORUM_DELETED');
    });
}
exports.default = CommunityForumController;
//# sourceMappingURL=communityForumControllers.js.map