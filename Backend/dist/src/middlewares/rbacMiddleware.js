"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = void 0;
const rbacService_1 = require("../services/rbacService");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('Unauthorized', 401);
            }
            const hasPermission = await (0, rbacService_1.checkPermission)(req.user.id, resource, action);
            if (!hasPermission) {
                throw (0, errorHandler_1.createAppError)('Forbidden', 403);
            }
            next();
        }
        catch (error) {
            logger_1.default.error('Permission check failed:', error);
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
const requireRole = (role) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw (0, errorHandler_1.createAppError)('Unauthorized', 401);
            }
            const hasRole = await (0, rbacService_1.checkRole)(req.user.id, role);
            if (!hasRole) {
                throw (0, errorHandler_1.createAppError)('Forbidden', 403);
            }
            next();
        }
        catch (error) {
            logger_1.default.error('Role check failed:', error);
            next(error);
        }
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=rbacMiddleware.js.map