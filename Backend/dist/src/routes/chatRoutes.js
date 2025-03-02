"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatControllers_js_1 = require("../controllers/chatControllers.js");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const validateRequest_js_1 = require("../middlewares/validateRequest.js");
const chatValidations_js_1 = require("../validations/chatValidations.js");
const router = express_1.default.Router();
router.get('/', authMiddleware_1.authMiddleware, chatControllers_js_1.getChats);
router.get('/:id', authMiddleware_1.authMiddleware, chatControllers_js_1.getChat);
router.post('/create', authMiddleware_1.authMiddleware, (0, validateRequest_js_1.validateRequest)(chatValidations_js_1.createChatValidationSchema), chatControllers_js_1.createChat);
router.post('/message/:id', authMiddleware_1.authMiddleware, (0, validateRequest_js_1.validateRequest)(chatValidations_js_1.messageValidationSchema), chatControllers_js_1.createMessage);
router.delete('/delete/:id', authMiddleware_1.authMiddleware, chatControllers_js_1.deleteChat);
exports.default = router;
//# sourceMappingURL=chatRoutes.js.map