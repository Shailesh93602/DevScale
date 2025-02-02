"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_js_1 = require("../controllers/chatControllers.js");
const authMiddleware_js_1 = require("../middlewares/authMiddleware.js");
const validationMiddleware_js_1 = require("../middlewares/validationMiddleware.js");
const router = express_1.default.Router();
router.get('/', authMiddleware_js_1.authMiddleware, chatControllers_js_1.getChats);
router.get('/:id', authMiddleware_js_1.authMiddleware, chatControllers_js_1.getChat);
router.post('/create', authMiddleware_js_1.authMiddleware, validationMiddleware_js_1.validateChatCreation, chatControllers_js_1.createChat);
router.post('/message/:id', authMiddleware_js_1.authMiddleware, validationMiddleware_js_1.validateMessageCreation, chatControllers_js_1.createMessage);
router.delete('/delete/:id', authMiddleware_js_1.authMiddleware, chatControllers_js_1.deleteChat);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map