import {
  PrismaClient,
  TicketStatus,
  TicketPriority,
  Severity,
  Priority,
  SupportTicket,
  BugReport,
  TicketResponse,
} from '@prisma/client';
import logger from '../utils/logger';
import { createAppError } from '../utils/errorHandler';
const prisma = new PrismaClient();

interface TicketData {
  title: string;
  description: string;
  category: string;
  priority: string;
  user_id: string;
}

interface BugReportData {
  title: string;
  description: string;
  severity: string;
  environment?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  user_id: string;
}

interface FeatureRequestData {
  title: string;
  description: string;
  category: string;
  priority: string;
  user_id: string;
}

interface HelpArticleData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export class SupportService {
  static async createTicket(data: TicketData) {
    try {
      const ticket = await prisma.supportTicket.create({
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

      // Notify support team
      await this.notifyNewTicket(ticket);

      return ticket;
    } catch (error) {
      logger.error('Failed to create support ticket:', error);
      throw createAppError('Failed to create support ticket', 500);
    }
  }

  static async updateTicketStatus(
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

    // Notify user of status change
    await this.notifyTicketUpdate(ticket);

    return ticket;
  }

  static async addTicketResponse(
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

    if (!is_internal) {
      // Notify user of new response
      await this.notifyNewResponse(response);
    }

    return response;
  }

  static async createBugReport(data: BugReportData) {
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

    // Notify development team
    await this.notifyNewBugReport(report);

    return report;
  }

  static async createFeatureRequest(data: FeatureRequestData) {
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

  static async voteFeatureRequest(requestId: string, user_id: string) {
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

  static async createHelpArticle(data: HelpArticleData) {
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

  static async searchHelpArticles(query: string) {
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

  private static async notifyNewTicket(ticket: SupportTicket) {
    // Implement notification logic
    logger.info('New support ticket created:', ticket);
  }

  private static async notifyTicketUpdate(ticket: SupportTicket) {
    // Implement notification logic
    logger.info('Support ticket updated:', ticket);
  }

  private static async notifyNewResponse(response: TicketResponse) {
    // Implement notification logic
    logger.info('New ticket response added:', response);
  }

  private static async notifyNewBugReport(report: BugReport) {
    // Implement notification logic
    logger.info('New bug report created:', report);
  }
}
