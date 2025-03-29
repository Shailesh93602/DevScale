"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const chatControllers_1 = __importDefault(require("../controllers/chatControllers"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_1 = require("../middlewares/validateRequest");
const chatValidations_1 = require("../validations/chatValidations");
class ChatRoutes extends BaseRouter_1.BaseRouter {
    chatController;
    constructor() {
        super();
        this.chatController = new chatControllers_1.default();
    }
    initializeRoutes() {
        this.router.get('/', authMiddleware_1.authMiddleware, this.chatController.getChats);
        this.router.get('/:id', authMiddleware_1.authMiddleware, this.chatController.getChat);
        this.router.post('/create', authMiddleware_1.authMiddleware, (0, validateRequest_1.validateRequest)(chatValidations_1.createChatValidationSchema), this.chatController.createChat);
        this.router.post('/message/:id', authMiddleware_1.authMiddleware, (0, validateRequest_1.validateRequest)(chatValidations_1.messageValidationSchema), this.chatController.createMessage);
        this.router.delete('/delete/:id', authMiddleware_1.authMiddleware, this.chatController.deleteChat);
    }
}
exports.ChatRoutes = ChatRoutes;
exports.default = new ChatRoutes().getRouter();
//# sourceMappingURL=chatRoutes.js.map