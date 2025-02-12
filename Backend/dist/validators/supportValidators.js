"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpArticleSchema = exports.featureRequestSchema = exports.bugReportSchema = exports.ticketSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ticketSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    description: joi_1.default.string().required().min(10),
    category: joi_1.default.string().required(),
    priority: joi_1.default.string().valid('low', 'medium', 'high', 'urgent').required(),
});
exports.bugReportSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    description: joi_1.default.string().required().min(10),
    severity: joi_1.default.string().valid('low', 'medium', 'high', 'critical').required(),
    environment: joi_1.default.string(),
    stepsToReproduce: joi_1.default.string(),
    expectedBehavior: joi_1.default.string(),
    actualBehavior: joi_1.default.string(),
});
exports.featureRequestSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    description: joi_1.default.string().required().min(10),
    category: joi_1.default.string().required(),
    priority: joi_1.default.string().valid('low', 'medium', 'high', 'critical').required(),
});
exports.helpArticleSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(5).max(200),
    content: joi_1.default.string().required().min(50),
    category: joi_1.default.string().required(),
    tags: joi_1.default.array().items(joi_1.default.string()),
});
//# sourceMappingURL=supportValidators.js.map