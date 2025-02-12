"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentApprovalWorkflow = void 0;
const client_1 = require("@prisma/client");
const eventSystem_1 = require("../../utils/eventSystem");
const prisma = new client_1.PrismaClient();
class ContentApprovalWorkflow {
    static async submitForReview(contentId) {
        await prisma.article.update({
            where: { id: contentId },
            data: {
                status: client_1.Status.PENDING,
            },
        });
        eventSystem_1.EventSystem.emit('content.submitted', {
            type: 'CONTENT_SUBMITTED',
            payload: { contentId },
            source: 'approval-workflow',
        });
    }
    static async processApproval(request) {
        const { contentId, reviewerId, status, comments } = request;
        await prisma.article.update({
            where: { id: contentId },
            data: { status },
        });
        await prisma.approvalHistory.create({
            data: {
                contentId,
                reviewerId,
                status,
                comments,
            },
        });
        eventSystem_1.EventSystem.emit('content.reviewed', {
            type: 'CONTENT_REVIEWED',
            payload: request,
            source: 'approval-workflow',
        });
    }
    static async getApprovalHistory(contentId) {
        return await prisma.approvalHistory.findMany({
            where: { contentId },
            orderBy: { createdAt: 'desc' },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
    }
}
exports.ContentApprovalWorkflow = ContentApprovalWorkflow;
//# sourceMappingURL=approvalWorkflow.js.map