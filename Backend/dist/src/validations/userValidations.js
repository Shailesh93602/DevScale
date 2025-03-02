"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInsertionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userInsertionSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    full_name: joi_1.default.string().trim().min(2).max(100).required().messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters',
    }),
    dob: joi_1.default.date().iso().max('now').optional().messages({
        'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
        'date.max': 'Date cannot be in the future',
    }),
    gender: joi_1.default.string().valid('male', 'female', 'other').optional().messages({
        'any.only': 'Gender must be either male, female, or other',
    }),
    mobile: joi_1.default.string()
        .pattern(/^(?:\+91|0)?[6-9]\d{9}$/)
        .optional()
        .messages({
        'string.pattern.base': 'Must be a valid 10-digit Indian phone number',
    }),
    address: joi_1.default.string().optional().allow(''),
    university: joi_1.default.string().optional(),
    college: joi_1.default.string().optional().allow(''),
    branch: joi_1.default.string().optional(),
    semester: joi_1.default.number().integer().min(1).max(8).optional().messages({
        'number.base': 'Semester must be a number between 1 and 8',
        'number.min': 'Semester cannot be less than 1',
        'number.max': 'Semester cannot exceed 8',
    }),
    skills: joi_1.default.array()
        .items(joi_1.default.string().trim().min(2).max(50))
        .optional()
        .allow(null)
        .default([])
        .messages({
        'array.base': 'Skills must be an array of strings',
        'string.min': 'Each skill must be at least 2 characters',
        'string.max': 'Each skill cannot exceed 50 characters',
    }),
}).options({ abortEarly: false, allowUnknown: false });
//# sourceMappingURL=userValidations.js.map