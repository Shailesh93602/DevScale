"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingContent = getPendingContent;
exports.moderateContent = moderateContent;
exports.reportContent = reportContent;
exports.getReportedContent = getReportedContent;
exports.getModerationLogs = getModerationLogs;
exports.autoModerateContent = autoModerateContent;
const client_1 = require("@prisma/client");
const errorHandler_1 = require("../utils/errorHandler");
const logger_1 = __importDefault(require("../utils/logger"));
const contentFilter_1 = require("../utils/contentFilter");
const prisma = new client_1.PrismaClient();
async function getPendingContent(type, page = 1, limit = 10) {
    const where = {
        status: 'pending',
        ...(type && { type }),
    };
    const [content, total] = await Promise.all([
        prisma.article.findMany({
            where,
            include: {
                author: {
                    select: {
                        username: true,
                        email: true,
                    },
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                created_at: 'asc',
            },
        }),
        prisma.article.count({ where }),
    ]);
    return {
        content,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
}
async function moderateContent(params) {
    const { content_id, content_type, status, moderations, moderator_id } = params;
    const result = await prisma.$transaction(async (tx) => {
        let content;
        switch (content_type) {
            case 'article':
                content = await tx.article.update({
                    where: { id: content_id },
                    data: {
                        status,
                        moderations: { set: moderations },
                    },
                    include: { author: { select: { id: true, email: true } } },
                });
                break;
            case 'comment':
                content = await tx.comment.update({
                    where: { id: content_id },
                    data: { content: moderations.map((m) => m.notes).join('\n') },
                    include: { user: { select: { id: true, email: true } } },
                });
                break;
            case 'forumPost':
                content = await tx.forumPost.update({
                    where: { id: content_id },
                    data: { content: moderations.map((m) => m.notes).join('\n') },
                    include: { user: { select: { id: true, email: true } } },
                });
                break;
            default:
                throw (0, errorHandler_1.createAppError)('Invalid content type', 400);
        }
        await tx.moderationLog.create({
            data: {
                content_id,
                content_type,
                moderator_id,
                action: status,
                notes: moderations.map((m) => m.notes).join('\n'),
            },
        });
        return content;
    });
    return result;
}
async function reportContent(params) {
    const { content_id, content_type, reporter_id, reason, details } = params;
    const report = await prisma.contentReport.create({
        data: {
            content_id,
            content_type,
            reporter_id,
            reason,
            details,
            status: 'pending',
        },
        include: { reporter: { select: { username: true } } },
    });
    const reportsCount = await prisma.contentReport.count({
        where: { content_id, content_type },
    });
    if (reportsCount >= 3) {
        await escalateContent(content_id, content_type);
    }
    return report;
}
async function getReportedContent(status, page = 1, limit = 10) {
    const where = status ? { status } : {};
    const [reports, total] = await Promise.all([
        prisma.contentReport.findMany({
            where,
            include: { reporter: { select: { username: true } } },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: 'desc' },
        }),
        prisma.contentReport.count({ where }),
    ]);
    return {
        reports,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
}
async function getModerationLogs(content_id, page = 1, limit = 10) {
    const where = content_id ? { content_id } : {};
    const [logs, total] = await Promise.all([
        prisma.moderationLog.findMany({
            where,
            include: { moderator: { select: { username: true } } },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { created_at: 'desc' },
        }),
        prisma.moderationLog.count({ where }),
    ]);
    return {
        logs,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        },
    };
}
async function autoModerateContent(content) {
    return contentFilter_1.ContentFilter.validateContent(content);
}
const escalateContent = async (contentId, contentType) => {
    const model = prisma[contentType];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await model.update({
        where: { id: contentId },
        data: { status: 'flagged' },
    });
    logger_1.default.warn('Content escalated for review:', {
        contentId,
        contentType,
        reason: 'Multiple reports',
    });
};
//# sourceMappingURL=contentModerationService.js.map