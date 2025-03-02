"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleAssignmentSchema = exports.permissionSchema = exports.roleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.roleSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(3).max(50),
    description: joi_1.default.string(),
    permissions: joi_1.default.array().items(joi_1.default.string()),
    parentId: joi_1.default.string(),
});
exports.permissionSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(3).max(50),
    description: joi_1.default.string(),
    resource: joi_1.default.string().required(),
    action: joi_1.default.string().required(),
    conditions: joi_1.default.object(),
});
exports.roleAssignmentSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    roleId: joi_1.default.string().required(),
});
//# sourceMappingURL=rbacValidations.js.map