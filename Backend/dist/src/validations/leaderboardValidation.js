"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardQuerySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.leaderboardQuerySchema = joi_1.default.object({
    subjectId: joi_1.default.string().required(),
    timeRange: joi_1.default.string()
        .valid('daily', 'weekly', 'monthly', 'all')
        .default('all'),
    limit: joi_1.default.number().min(1).max(100).default(10),
});
//# sourceMappingURL=leaderboardValidation.js.map