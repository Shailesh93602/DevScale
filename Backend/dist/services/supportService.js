"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
class SupportService {
    static async createTicket(data) {
        try {
            const ticket = await prisma.supportTicket.create({
                data: {
                    title: data.title,
                    description: data.description,
                    category: data.category,
                    priority: data.priority,
                    user_id: data.user_id,
                },
                include: {
                    user: {
                        select: {
                            email: true,
                            username: true,
                        },
                    },
                },
            });
            // Notify support team
            await this.notifyNewTicket(ticket);
            return ticket;
        }
        catch (error) {
            logger_1.default.error('Failed to create support ticket:', error);
            throw (0, errorHandler_1.createAppError)('Failed to create support ticket', 500);
        }
    }
    static async updateTicketStatus(ticket_id, status, agent_id) {
        const ticket = await prisma.supportTicket.update({
            where: { id: ticket_id },
            data: {
                status,
                assigned_to: agent_id,
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        // Notify user of status change
        await this.notifyTicketUpdate(ticket);
        return ticket;
    }
    static async addTicketResponse(ticket_id, user_id, content, is_internal = false) {
        const response = await prisma.ticketResponse.create({
            data: {
                ticket_id,
                user_id,
                content,
                is_internal,
            },
            include: {
                ticket: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
        });
        if (!is_internal) {
            // Notify user of new response
            await this.notifyNewResponse(response);
        }
        return response;
    }
    static async createBugReport(data) {
        const report = await prisma.bugReport.create({
            data: {
                title: data.title,
                description: data.description,
                severity: data.severity,
                environment: data.environment,
                steps_to_reproduce: data.steps_to_reproduce,
                expected_behavior: data.expected_behavior,
                actual_behavior: data.actual_behavior,
                user_id: data.user_id,
            },
        });
        // Notify development team
        await this.notifyNewBugReport(report);
        return report;
    }
    static async createFeatureRequest(data) {
        const request = await prisma.featureRequest.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                user_id: data.user_id,
            },
        });
        return request;
    }
    static async voteFeatureRequest(requestId, user_id) {
        await prisma.$transaction(async (tx) => {
            await tx.featureRequestVote.create({
                data: {
                    feature_request_id: requestId,
                    user_id,
                },
            });
            await tx.featureRequest.update({
                where: { id: requestId },
                data: {
                    upvotes: {
                        increment: 1,
                    },
                },
            });
        });
    }
    static async createHelpArticle(data) {
        const article = await prisma.helpArticle.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                tags: data.tags,
            },
        });
        return article;
    }
    static async searchHelpArticles(query) {
        const articles = await prisma.helpArticle.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                ],
                is_published: true,
            },
            orderBy: {
                views: 'desc',
            },
        });
        return articles;
    }
    static async notifyNewTicket(ticket) {
        // Implement notification logic
        logger_1.default.info('New support ticket created:', ticket);
    }
    static async notifyTicketUpdate(ticket) {
        // Implement notification logic
        logger_1.default.info('Support ticket updated:', ticket);
    }
    static async notifyNewResponse(response) {
        // Implement notification logic
        logger_1.default.info('New ticket response added:', response);
    }
    static async notifyNewBugReport(report) {
        // Implement notification logic
        logger_1.default.info('New bug report created:', report);
    }
}
exports.SupportService = SupportService;
//# sourceMappingURL=supportService.js.map