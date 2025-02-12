"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBooksSchema = exports.getResourcesSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.getResourcesSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    subjectId: joi_1.default.string().optional(),
});
exports.getBooksSchema = joi_1.default.object({
    subjectId: joi_1.default.string().required(),
    level: joi_1.default.string().valid('beginner', 'intermediate', 'advanced').required(),
});
//# sourceMappingURL=placementValidation.js.map