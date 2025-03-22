"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollRoadmapValidation = exports.updateSubjectsOrderValidation = exports.createRoadmapValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createRoadmapValidation = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        'any.required': 'Title is required',
    }),
    description: joi_1.default.string().required().messages({
        'any.required': 'Description is required',
    }),
    difficulty: joi_1.default.string()
        .valid('beginner', 'intermediate', 'advanced')
        .required()
        .messages({
        'any.required': 'Difficulty is required',
        'any.only': 'Invalid difficulty level',
    }),
    estimatedHours: joi_1.default.number().optional().integer().min(1).messages({
        'number.base': 'Estimated hours must be a number',
        'number.min': 'Estimated hours must be a positive number',
    }),
    tags: joi_1.default.array().optional().messages({
        'any.required': 'Tags must be an array',
    }),
});
exports.updateSubjectsOrderValidation = joi_1.default.object({
    subjectOrders: joi_1.default.array()
        .required()
        .messages({
        'any.required': 'Subject orders must be an array',
    })
        .custom((orders) => {
        return orders.every((order) => typeof order.subjectId === 'string' &&
            typeof order.order === 'number' &&
            order.order >= 0);
    })
        .messages({
        'any.custom': 'Invalid subject order format',
    }),
});
exports.enrollRoadmapValidation = joi_1.default.object({
    roadmapId: joi_1.default.string().required().messages({
        'any.required': 'Roadmap ID is required',
    }),
});
//# sourceMappingURL=roadmapValidation.js.map