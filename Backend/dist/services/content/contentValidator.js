"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = __importDefault(require("../../utils/logger"));
// Content type schemas
const ImageContent = joi_1.default.object({
    type: joi_1.default.string().valid('image').required(),
    url: joi_1.default.string().uri().required(),
    alt: joi_1.default.string().required(),
    caption: joi_1.default.string().optional(),
});
const VideoContent = joi_1.default.object({
    type: joi_1.default.string().valid('video').required(),
    url: joi_1.default.string().uri().required(),
    provider: joi_1.default.string().valid('youtube', 'vimeo').required(),
    duration: joi_1.default.number().required(),
});
const CodeContent = joi_1.default.object({
    type: joi_1.default.string().valid('code').required(),
    language: joi_1.default.string().required(),
    code: joi_1.default.string().required(),
    explanation: joi_1.default.string().optional(),
});
const TextContent = joi_1.default.object({
    type: joi_1.default.string().valid('text').required(),
    content: joi_1.default.string().required(),
    format: joi_1.default.string().valid('markdown', 'plain').required(),
});
const ContentSchema = joi_1.default.alternatives().try(ImageContent, VideoContent, CodeContent, TextContent);
class ContentValidator {
    static validate(content) {
        const { error, value } = ContentSchema.validate(content);
        if (error) {
            logger_1.default.error('Content validation failed:', error);
            throw error;
        }
        return value;
    }
    static validateBatch(contents) {
        return contents.map((content) => this.validate(content));
    }
}
exports.ContentValidator = ContentValidator;
//# sourceMappingURL=contentValidator.js.map