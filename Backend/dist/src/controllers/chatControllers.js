"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChat = exports.createMessage = exports.createChat = exports.getChat = exports.getChats = void 0;
const client_1 = require("@prisma/client");
const utils_1 = require("../utils");
const prisma = new client_1.PrismaClient();
// TODO: implement this feature
exports.getChats = (0, utils_1.catchAsync)(async (req, res) => {
    const chats = await prisma.chat.findMany({
        orderBy: { created_at: 'asc' },
    });
    res.status(200).json({ success: true, chats });
});
exports.getChat = (0, utils_1.catchAsync)(async (req, res) => {
    const chatId = req.params.id;
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
    });
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    res.status(200).json({ success: true, chat });
});
exports.createChat = (0, utils_1.catchAsync)(async (req, res) => {
    const { participants } = req.body;
    if (!participants || participants.length < 2) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    // TODO: implement this method
    // const newChat = await prisma.chat.create({
    // data: { user2Id: participants },
    // });
    res.status(201).json({
        success: true,
        message: 'Chat created successfully!',
        // chat: newChat,
    });
});
exports.createMessage = (0, utils_1.catchAsync)(async (req, res) => {
    const chatId = req.params.id;
    const { message, sender } = req.body;
    if (!message || !sender) {
        return res.status(400).json({ success: false, message: 'Invalid payload' });
    }
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
    });
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    // await prisma.chat.update({
    //   where: { id: chatId },
    //   data: {
    //     messages: {
    //       push: { message, sender },
    //     },
    //   },
    // });
    res
        .status(201)
        .json({ success: true, message: 'Message sent successfully!' });
});
exports.deleteChat = (0, utils_1.catchAsync)(async (req, res) => {
    const chatId = req.params.id;
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
    });
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    await prisma.chat.delete({
        where: { id: chatId },
    });
    res
        .status(200)
        .json({ success: true, message: 'Chat deleted successfully!' });
});
//# sourceMappingURL=chatControllers.js.map