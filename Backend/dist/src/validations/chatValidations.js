"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageValidationSchema = exports.createChatValidationSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createChatValidationSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    participants: joi_1.default.array().items(joi_1.default.string()).required(),
});
exports.messageValidationSchema = joi_1.default.object({
    message: joi_1.default.string().required().min(5).max(200),
});
//# sourceMappingURL=chatValidations.js.map