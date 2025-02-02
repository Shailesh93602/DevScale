"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteForum = exports.updateForum = exports.createForum = exports.getForum = exports.getForums = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
exports.getForums = (0, utils_1.catchAsync)(async (req, res) => {
    const forums = await prisma.forum.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, forums });
});
exports.getForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const forum = await prisma.forum.findUnique({
        where: { id: forumId },
    });
    if (!forum) {
        return res.status(404).json({ success: false, message: 'Forum not found' });
    }
    res.status(200).json({ success: true, forum });
});
exports.createForum = (0, utils_1.catchAsync)(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    await prisma.forum.create({
        data: {
            title,
            description,
            createdBy: req.user.id,
        },
    });
    res
        .status(201)
        .json({ success: true, message: 'Forum created successfully!' });
});
exports.updateForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const { title, description } = req.body;
    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    const updatedForum = await prisma.forum.update({
        where: { id: forumId },
        data: { title, description },
    });
    if (!updatedForum) {
        return res.status(404).json({ success: false, message: 'Forum not found' });
    }
    res
        .status(200)
        .json({ success: true, message: 'Forum updated successfully!' });
});
exports.deleteForum = (0, utils_1.catchAsync)(async (req, res) => {
    const forumId = req.params.id;
    const deletedForum = await prisma.forum.delete({
        where: { id: forumId },
    });
    if (!deletedForum) {
        return res.status(404).json({ success: false, message: 'Forum not found' });
    }
    res
        .status(200)
        .json({ success: true, message: 'Forum deleted successfully!' });
});
//# sourceMappingURL=communityForumControllers.js.map