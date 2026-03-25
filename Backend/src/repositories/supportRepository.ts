import {
  PrismaClient,
  TicketStatus,
  TicketPriority,
  Severity,
  Priority,
} from '@prisma/client';
import logger from '../utils/logger';
import { createAppError } from '../utils/errorHandler';
import {
  BugReportData,
  FeatureRequestData,
  HelpArticleData,
  TicketData,
} from '@/types';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export default class SupportRepository extends BaseRepository<
  PrismaClient['supportTicket']
> {
  constructor() {
    super(prisma.supportTicket);
  }

  async createTicket(data: TicketData) {
    try {
      const ticket = await this.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority as TicketPriority,
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

      return ticket;
    } catch (error) {
      logger.error('Failed to create support ticket:', error);
      throw createAppError('Failed to create support ticket', 500);
    }
  }

  async updateTicketStatus(
    ticket_id: string,
    status: TicketStatus,
    agent_id: string
  ) {
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

    return ticket;
  }

  async addTicketResponse(
    ticket_id: string,
    user_id: string,
    content: string,
    is_internal: boolean = false
  ) {
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

    return response;
  }

  async createBugReport(data: BugReportData) {
    const report = await prisma.bugReport.create({
      data: {
        title: data.title,
        description: data.description,
        severity: data.severity as Severity,
        environment: data.environment,
        steps_to_reproduce: data.steps_to_reproduce,
        expected_behavior: data.expected_behavior,
        actual_behavior: data.actual_behavior,
        user_id: data.user_id,
      },
    });

    return report;
  }

  async createFeatureRequest(data: FeatureRequestData) {
    const request = await prisma.featureRequest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority as Priority,
        user_id: data.user_id,
      },
    });

    return request;
  }

  async voteFeatureRequest(requestId: string, user_id: string) {
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

  async createHelpArticle(data: HelpArticleData) {
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

  async searchHelpArticles(query: string) {
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
}
