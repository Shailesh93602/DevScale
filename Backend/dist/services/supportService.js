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
                    userId: data.userId,
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
    static async updateTicketStatus(ticketId, status, agentId) {
        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                status,
                assignedTo: agentId,
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
    static async addTicketResponse(ticketId, userId, content, isInternal = false) {
        const response = await prisma.ticketResponse.create({
            data: {
                ticketId,
                userId,
                content,
                isInternal,
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
        if (!isInternal) {
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
                stepsToReproduce: data.stepsToReproduce,
                expectedBehavior: data.expectedBehavior,
                actualBehavior: data.actualBehavior,
                userId: data.userId,
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
                userId: data.userId,
            },
        });
        return request;
    }
    static async voteFeatureRequest(requestId, userId) {
        await prisma.$transaction(async (tx) => {
            await tx.featureRequestVote.create({
                data: {
                    featureRequestId: requestId,
                    userId,
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
                isPublished: true,
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