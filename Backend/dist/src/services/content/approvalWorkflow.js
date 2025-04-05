"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentApprovalWorkflow = void 0;
const client_1 = require("@prisma/client");
const eventSystem_1 = require("../../utils/eventSystem");
const prisma_1 = __importDefault(require("@/lib/prisma"));
class ContentApprovalWorkflow {
    static async submitForReview(content_id) {
        await prisma_1.default.article.update({
            where: { id: content_id },
            data: {
                status: client_1.Status.PENDING,
            },
        });
        eventSystem_1.EventSystem.emit('content.submitted', {
            type: 'CONTENT_SUBMITTED',
            payload: { content_id },
            source: 'approval-workflow',
        });
    }
    static async processApproval(request) {
        const { content_id, reviewer_id, status, comments } = request;
        await prisma_1.default.article.update({
            where: { id: content_id },
            data: { status },
        });
        await prisma_1.default.approvalHistory.create({
            data: {
                content_id: content_id,
                reviewer_id: reviewer_id,
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
    static async getApprovalHistory(content_id) {
        return await prisma_1.default.approvalHistory.findMany({
            where: { content_id: content_id },
            orderBy: { created_at: 'desc' },
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