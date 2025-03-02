"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitChallengeValidation = exports.createChallengeValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
exports.createChallengeValidation = joi_1.default.object({
    title: joi_1.default.string().required().messages({
        'any.required': 'Title is required',
    }),
    description: joi_1.default.string().required().messages({
        'any.required': 'Description is required',
    }),
    difficulty: joi_1.default.string()
        .valid(...Object.values(client_1.Difficulty))
        .required()
        .messages({
        'any.required': 'Difficulty is required',
        'any.only': 'Invalid difficulty level',
    }),
    category: joi_1.default.string().required().messages({
        'any.required': 'Category is required',
    }),
    inputFormat: joi_1.default.string().required().messages({
        'any.required': 'Input format is required',
    }),
    outputFormat: joi_1.default.string().required().messages({
        'any.required': 'Output format is required',
    }),
    exampleInput: joi_1.default.string().required().messages({
        'any.required': 'Example input is required',
    }),
    constraints: joi_1.default.string().required().messages({
        'any.required': 'Constraints are required',
    }),
    functionSignature: joi_1.default.string().required().messages({
        'any.required': 'Function signature is required',
    }),
    timeLimit: joi_1.default.number().optional().integer().min(1).messages({
        'number.base': 'Time limit must be a number',
        'number.min': 'Time limit must be a positive number',
    }),
    memoryLimit: joi_1.default.number().optional().integer().min(1).messages({
        'number.base': 'Memory limit must be a number',
        'number.min': 'Memory limit must be a positive number',
    }),
    tags: joi_1.default.array().optional().messages({
        'any.required': 'Tags must be an array',
    }),
    testCases: joi_1.default.array().required().messages({
        'any.required': 'Test cases must be an array',
    }),
    'testCases.*.input': joi_1.default.string().required().messages({
        'any.required': 'Test case input is required',
    }),
    'testCases.*.output': joi_1.default.string().required().messages({
        'any.required': 'Test case output is required',
    }),
    language: joi_1.default.string()
        .valid(...['javascript', 'python', 'java', 'cpp'])
        .required()
        .messages({
        'any.required': 'Language is required',
        'any.only': 'Unsupported programming language',
    }),
});
exports.submitChallengeValidation = joi_1.default.object({
    code: joi_1.default.string().required().messages({
        'any.required': 'Code is required',
    }),
    language: joi_1.default.string()
        .valid(...['javascript', 'python', 'java', 'cpp'])
        .required()
        .messages({
        'any.required': 'Language is required',
        'any.only': 'Unsupported programming language',
    }),
});
//# sourceMappingURL=challengeValidation.js.map