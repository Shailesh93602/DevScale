import { PrismaClient, Status } from '@prisma/client';
import { EventSystem } from '../../utils/eventSystem';

const prisma = new PrismaClient();

interface ApprovalRequest {
  contentId: string;
  reviewerId: string;
  status: Status;
  comments?: string;
}

export class ContentApprovalWorkflow {
  static async submitForReview(contentId: string) {
    await prisma.article.update({
      where: { id: contentId },
      data: {
        status: Status.PENDING,
      },
    });

    EventSystem.emit('content.submitted', {
      type: 'CONTENT_SUBMITTED',
      payload: { contentId },
      source: 'approval-workflow',
    });
  }

  static async processApproval(request: ApprovalRequest) {
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

    EventSystem.emit('content.reviewed', {
      type: 'CONTENT_REVIEWED',
      payload: request,
      source: 'approval-workflow',
    });
  }

  static async getApprovalHistory(contentId: string) {
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
