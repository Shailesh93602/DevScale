"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const apiResponse_1 = require("@/utils/apiResponse");
const errorHandler_1 = require("@/utils/errorHandler");
const chatRepository_1 = __importDefault(require("@/repositories/chatRepository"));
class ChatController {
    chatRepo;
    constructor() {
        this.chatRepo = new chatRepository_1.default();
    }
    getChats = (0, utils_1.catchAsync)(async (req, res) => {
        const chats = await this.chatRepo.findMany({
            orderBy: { created_at: 'asc' },
        });
        (0, apiResponse_1.sendResponse)(res, 'CHATS_FETCHED', { data: chats });
    });
    getChat = (0, utils_1.catchAsync)(async (req, res) => {
        const chatId = req.params.id;
        const chat = await this.chatRepo.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw (0, errorHandler_1.createAppError)('Chat not found', 404);
        }
        (0, apiResponse_1.sendResponse)(res, 'CHATS_FETCHED', { data: chat });
    });
    createChat = (0, utils_1.catchAsync)(async (req, res) => {
        const { participants } = req.body;
        if (!participants || participants.length < 2) {
            throw (0, errorHandler_1.createAppError)('Invalid payload', 400);
        }
        // TODO: implement this method
        const newChat = await this.chatRepo.create({
            data: {
                message: '',
                user1: { connect: { id: participants[0] } },
                user2: { connect: { id: participants[1] } },
            },
        });
        (0, apiResponse_1.sendResponse)(res, 'CHAT_CREATED', { data: newChat });
    });
    createMessage = (0, utils_1.catchAsync)(async (req, res) => {
        const chatId = req.params.id;
        const { message, sender } = req.body;
        if (!message || !sender) {
            throw (0, errorHandler_1.createAppError)('Invalid payload', 400);
        }
        const chat = await this.chatRepo.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw (0, errorHandler_1.createAppError)('Chat not found', 404);
        }
        // await this.chatRepo.update({
        //   where: { id: chatId },
        //   data: {
        //     messages: {
        //       push: { message, sender },
        //     },
        //   },
        // });
        (0, apiResponse_1.sendResponse)(res, 'CHAT_MESSAGE_SENT');
    });
    deleteChat = (0, utils_1.catchAsync)(async (req, res) => {
        const chatId = req.params.id;
        const chat = await this.chatRepo.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw (0, errorHandler_1.createAppError)('Chat not found', 404);
        }
        await this.chatRepo.delete({
            where: { id: chatId },
        });
        (0, apiResponse_1.sendResponse)(res, 'CHAT_DELETED');
    });
}
exports.default = ChatController;
//# sourceMappingURL=chatControllers.js.map