"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemLogs = exports.getAccessLogs = exports.getChangeHistory = exports.getSecurityAuditLogs = exports.getAdminAuditLogs = exports.logSystemEvent = exports.logAccess = exports.trackChange = exports.logSecurityEvent = exports.logAdminAction = void 0;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
const logAdminAction = async (params) => {
    try {
        const log = await prisma.adminAuditLog.create({
            data: {
                ...params,
                details: params.details
                    ? params.details
                    : client_1.Prisma.DbNull,
            },
        });
        logger_1.default.info('Admin action logged', { logId: log.id, ...params });
        return log;
    }
    catch (error) {
        logger_1.default.error('Failed to log admin action:', error);
        throw (0, errorHandler_1.createAppError)('Failed to log admin action', 500);
    }
};
exports.logAdminAction = logAdminAction;
const logSecurityEvent = async (params) => {
    try {
        const log = await prisma.securityAuditLog.create({
            data: {
                ...params,
                metadata: params.metadata,
            },
        });
        if (params.severity === 'critical') {
            await notifyCriticalSecurityEvent(log);
        }
        return log;
    }
    catch (error) {
        logger_1.default.error('Failed to log security event:', error);
        throw (0, errorHandler_1.createAppError)('Failed to log security event', 500);
    }
};
exports.logSecurityEvent = logSecurityEvent;
const trackChange = async (params) => {
    try {
        return await prisma.changeHistory.create({
            data: {
                ...params,
                changes: params.changes
                    ? params.changes
                    : client_1.Prisma.JsonNull,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Failed to track change:', error);
        throw (0, errorHandler_1.createAppError)('Failed to track change', 500);
    }
};
exports.trackChange = trackChange;
const logAccess = async (user_id, route, method, status_code, ip_address, user_agent, duration) => {
    try {
        await prisma.accessLog.create({
            data: {
                user_id,
                route,
                method,
                status_code,
                ip_address,
                user_agent,
                duration,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Failed to log access:', error);
    }
};
exports.logAccess = logAccess;
const logSystemEvent = async (type, level, message, metadata) => {
    try {
        await prisma.systemLog.create({
            data: {
                type,
                level,
                message,
                metadata: metadata,
            },
        });
    }
    catch (error) {
        logger_1.default.error('Failed to log system event:', error);
    }
};
exports.logSystemEvent = logSystemEvent;
// Query functions
const getAdminAuditLogs = async (filters, page = 1, limit = 10) => {
    const where = buildWhereClause(filters);
    return paginateResults(prisma.adminAuditLog, where, page, limit);
};
exports.getAdminAuditLogs = getAdminAuditLogs;
const getSecurityAuditLogs = async (filters, page = 1, limit = 10) => {
    const where = buildWhereClause(filters);
    return paginateResults(prisma.securityAuditLog, where, page, limit);
};
exports.getSecurityAuditLogs = getSecurityAuditLogs;
const getChangeHistory = async (filters, page = 1, limit = 10) => {
    const where = buildWhereClause(filters);
    return paginateResults(prisma.changeHistory, where, page, limit);
};
exports.getChangeHistory = getChangeHistory;
const getAccessLogs = async (filters, page = 1, limit = 10) => {
    const where = buildWhereClause(filters);
    return paginateResults(prisma.accessLog, where, page, limit);
};
exports.getAccessLogs = getAccessLogs;
const getSystemLogs = async (filters, page = 1, limit = 10) => {
    const where = buildWhereClause(filters);
    return paginateResults(prisma.systemLog, where, page, limit);
};
exports.getSystemLogs = getSystemLogs;
// Helper functions
const buildWhereClause = (filters) => {
    const where = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
            where[key] = value;
    });
    return where;
};
const paginateResults = async (model, where, page, limit) => {
    const [data, total] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: 'desc' },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model.count({ where }),
    ]);
    return {
        data,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
};
const notifyCriticalSecurityEvent = async (log) => {
    logger_1.default.warn('Critical security event:', log);
    // Implement notification logic
};
//# sourceMappingURL=auditService.js.map