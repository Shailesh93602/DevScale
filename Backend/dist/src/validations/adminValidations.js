"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportConfigSchema = exports.resourceAllocationSchema = exports.configUpdateSchema = exports.userSearchSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.userSearchSchema = joi_1.default.object({
    query: joi_1.default.string().optional().default(''),
    role: joi_1.default.string().optional().default(''),
});
exports.configUpdateSchema = joi_1.default.object({
    key: joi_1.default.string().required(),
    value: joi_1.default.any().required(),
});
exports.resourceAllocationSchema = joi_1.default.object({
    resourceType: joi_1.default.string().valid('storage', 'compute', 'network').required(),
    resourceId: joi_1.default.string().required(),
    allocation: joi_1.default.number().positive().required(),
});
exports.reportConfigSchema = joi_1.default.object({
    type: joi_1.default.string().valid('user', 'platform').required(),
    id: joi_1.default.string().optional(),
    dateRange: joi_1.default.object({
        start: joi_1.default.date().required(),
        end: joi_1.default.date().min(joi_1.default.ref('start')).required(),
    }).optional(),
});
//# sourceMappingURL=adminValidations.js.map