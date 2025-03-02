"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgressValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateProgressValidation = joi_1.default.object({
    topicId: joi_1.default.string().required().messages({
        'any.required': 'Topic ID is required',
    }),
    status: joi_1.default.string().valid('completed', 'in_progress').required().messages({
        'any.required': 'Status is required',
        'any.only': 'Invalid status',
    }),
    score: joi_1.default.number().optional().integer().min(0).max(100).messages({
        'number.base': 'Score must be a number',
        'number.min': 'Score must be between 0 and 100',
        'number.max': 'Score must be between 0 and 100',
    }),
});
//# sourceMappingURL=progressValidation.js.map