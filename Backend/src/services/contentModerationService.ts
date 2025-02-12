import { PrismaClient, Status } from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { ContentFilter } from '../utils/contentFilter';

const prisma = new PrismaClient();

export interface ModerateContentParams {
  contentId: string;
  contentType: 'article' | 'comment' | 'forumPost';
  status: Status;
  moderatorId: string;
  moderationNotes?: string;
}

export interface ReportedContentParams {
  contentId: string;
  contentType: string;
  reporterId: string;
  reason: string;
  details?: string;
}

export async function getPendingContent(type?: string, page = 1, limit = 10) {
  const where = {
    status: 'pending' as Status,
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

export async function moderateContent(params: ModerateContentParams) {
  const { contentId, contentType, status, moderatorId, moderationNotes } =
    params;

  const result = await prisma.$transaction(async (tx) => {
    let content;

    switch (contentType) {
      case 'article':
        content = await tx.article.update({
          where: { id: contentId },
          data: { status, moderationNotes },
          include: { author: { select: { id: true, email: true } } },
        });
        break;
      case 'comment':
        content = await tx.comment.update({
          where: { id: contentId },
          data: { content: moderationNotes },
          include: { user: { select: { id: true, email: true } } },
        });
        break;
      case 'forumPost':
        content = await tx.forumPost.update({
          where: { id: contentId },
          data: { content: moderationNotes },
          include: { user: { select: { id: true, email: true } } },
        });
        break;
      default:
        throw createAppError('Invalid content type', 400);
    }

    await tx.moderationLog.create({
      data: {
        contentId,
        contentType,
        moderatorId,
        action: status,
        notes: moderationNotes,
      },
    });

    return content;
  });

  return result;
}

export async function reportContent(params: ReportedContentParams) {
  const { contentId, contentType, reporterId, reason, details } = params;

  const report = await prisma.contentReport.create({
    data: {
      contentId,
      contentType,
      reporterId,
      reason,
      details,
      status: 'pending',
    },
    include: { reporter: { select: { username: true } } },
  });

  const reportsCount = await prisma.contentReport.count({
    where: { contentId, contentType },
  });

  if (reportsCount >= 3) {
    await escalateContent(contentId, contentType);
  }

  return report;
}

export async function getReportedContent(
  status?: string,
  page = 1,
  limit = 10
) {
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

export async function getModerationLogs(
  contentId?: string,
  page = 1,
  limit = 10
) {
  const where = contentId ? { contentId } : {};

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

export async function autoModerateContent(content: string): Promise<boolean> {
  return ContentFilter.validateContent(content);
}

const escalateContent = async (contentId: string, contentType: string) => {
  type ModelType = 'article' | 'comment' | 'forumPost';
  const model = prisma[
    contentType as ModelType as keyof PrismaClient
  ] as PrismaClient[ModelType];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (model as any).update({
    where: { id: contentId },
    data: { status: 'flagged' },
  });

  logger.warn('Content escalated for review:', {
    contentId,
    contentType,
    reason: 'Multiple reports',
  });
};
