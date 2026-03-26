import { Status } from '@prisma/client';
import { EventSystem } from '../../utils/eventSystem';

import prisma from '../../lib/prisma';

interface ApprovalRequest {
  content_id: string;
  reviewer_id: string;
  status: Status;
  comments?: string;
}

export class ContentApprovalWorkflow {
  static async submitForReview(content_id: string) {
    await prisma.article.update({
      where: { id: content_id },
      data: {
        status: Status.PENDING,
      },
    });

    EventSystem.emit('content.submitted', {
      type: 'CONTENT_SUBMITTED',
      payload: { content_id },
      source: 'approval-workflow',
    });
  }

  static async processApproval(request: ApprovalRequest) {
    const { content_id, reviewer_id, status, comments } = request;

    await prisma.article.update({
      where: { id: content_id },
      data: { status },
    });

    await prisma.approvalHistory.create({
      data: {
        content_id: content_id,
        reviewer_id: reviewer_id,
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

  static async getApprovalHistory(content_id: string) {
    return await prisma.approvalHistory.findMany({
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
