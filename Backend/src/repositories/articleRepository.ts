import {
  PrismaClient,
  Status,
  Prisma,
  ContentModeration,
  Article,
} from '@prisma/client';
import { createAppError } from '../utils/errorHandler';
import logger from '@/utils/logger';
import BaseRepository from './baseRepository';
import { invalidateCachePattern } from '@/services/cacheService';
import { ArticleFilters } from '@/types';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { ContentFilter } from '@/utils/contentFilter';

const prisma = new PrismaClient();

export class ArticleRepository extends BaseRepository<PrismaClient['article']> {
  constructor() {
    super(prisma.article);
  }

  async getArticles(filters: ArticleFilters) {
    try {
      const whereCondition: Prisma.ArticleWhereInput = {};

      if (filters.status) {
        whereCondition.status = filters.status;
      }

      if (filters.search) {
        whereCondition.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { content: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.author_id) {
        whereCondition.author_id = filters.author_id;
      }

      const articles = await this.findMany({
        where: whereCondition,
        include: {
          author: {
            select: { username: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      return articles;
    } catch (error) {
      logger.error('Error fetching articles:', error);
      throw createAppError('Failed to fetch articles', 500);
    }
  }

  async getArticleById(id: string) {
    try {
      const article = await this.findUnique({
        where: { id },
        include: {
          author: {
            select: { username: true },
          },
          topic: true,
          moderations: {
            include: {
              moderator: {
                select: { username: true },
              },
            },
          },
        },
      });

      if (!article) {
        throw createAppError('Article not found', 404);
      }

      return article;
    } catch (error) {
      logger.error('Error fetching article by id:', error);
      throw createAppError('Failed to fetch article', 500);
    }
  }

  async createArticle(data: {
    title: string;
    content: string;
    author_id: string;
    topic_id: string;
  }) {
    try {
      const article = await this.create({
        data: {
          ...data,
          status: 'PENDING',
        },
        include: {
          author: {
            select: { username: true },
          },
        },
      });

      return article;
    } catch (error) {
      logger.error('Error creating article:', error);
      throw createAppError('Failed to create article', 500);
    }
  }

  // async updateArticle(
  //   id: string,
  //   data: {
  //     title?: string;
  //     content?: string;
  //     status?: Status;
  //     moderations?: {
  //       create: Array<{
  //         content_type: string;
  //         action: string;
  //         notes: string;
  //         moderator_id: string;
  //       }>;
  //     };
  //   }
  // ) {
  //   try {
  //     const article = await this.update({
  //       where: { id },
  //       data,
  //       include: {
  //         author: {
  //           select: { username: true },
  //         },
  //         moderations: {
  //           include: {
  //             moderator: {
  //               select: { username: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     return article;
  //   } catch (error) {
  //     logger.error('Error updating article:', error);
  //     throw createAppError('Failed to update article', 500);
  //   }
  // }
  async updateArticle(
    id: string,
    data: {
      title?: string;
      content?: string;
      images?: Express.Multer.File[];
      status?: string;
      moderations?: {
        create: [
          {
            content_type: string;
            action: string;
            notes: string;
            moderator_id: string;
          },
        ];
      };
    }
  ): Promise<Article> {
    const currentArticle = await this.findUnique({
      where: { id },
    });
    if (!currentArticle) throw createAppError('Article not found', 404);

    await prisma.version.create({
      data: {
        article_id: id,
        content: currentArticle.content,
        title: currentArticle.title,
        version: (await this.getLatestVersion(id)) + 1,
      },
    });

    let processedContent = data.content;
    if (data.images?.length) {
      processedContent = await this.processArticleImages(
        data.content ?? currentArticle.content,
        data.images
      );
    }

    return this.update({
      where: { id },
      data: {
        title: data.title,
        content: processedContent,
        status: Status.PENDING,
      },
      include: {
        author: { select: { username: true, avatar_url: true } },
        topic: true,
      },
    });
  }

  async deleteArticle(id: string) {
    try {
      await this.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting article:', error);
      throw createAppError('Failed to delete article', 500);
    }
  }

  async manageArticle(article_id: string, action: string) {
    const article = await this.findUnique({
      where: { id: article_id },
    });
    if (!article) throw createAppError('Article not found', 404);

    switch (action) {
      case 'approve':
        await this.update({
          where: { id: article_id },
          data: { status: Status.APPROVED },
        });
        break;
      case 'reject':
        await this.update({
          where: { id: article_id },
          data: { status: Status.REJECTED },
        });
        break;
      case 'delete':
        await this.delete({ where: { id: article_id } });
        break;
      default:
        throw createAppError('Invalid action', 400);
    }

    await invalidateCachePattern(`article:${article_id}:*`);
  }

  async submitArticle(data: {
    title: string;
    content: string;
    author_id: string;
    topic_id: string;
    tags?: string[];
    images?: Express.Multer.File[];
  }): Promise<Article> {
    let processedContent = data.content;
    if (data.images?.length) {
      processedContent = await this.processArticleImages(
        data.content,
        data.images
      );
    }

    const article = await this.create({
      data: {
        title: data.title,
        content: processedContent,
        author_id: data.author_id,
        topic_id: data.topic_id,
        status: Status.PENDING,
      },
      include: {
        author: { select: { username: true, avatar_url: true } },
        topic: true,
      },
    });

    await this.trackSubmission(data.author_id, article.id);
    return article;
  }

  async reviewArticle(data: {
    article_id: string;
    reviewer_id: string;
    status: Status;
    moderations: ContentModeration[];
  }): Promise<Article> {
    const article = await this.update({
      where: { id: data.article_id },
      data: {
        status: data.status,
        moderations: { set: data.moderations },
      },
      include: { author: { select: { username: true, email: true } } },
    });

    await this.notifyAuthor(article);
    return article;
  }

  async getArticlesByTopic(topic_id: string) {
    return this.findMany({
      where: { topic_id: topic_id, status: Status.APPROVED },
      include: {
        author: { select: { username: true, avatar_url: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getPendingArticles() {
    return this.findMany({
      where: { status: Status.PENDING },
      include: {
        author: { select: { username: true, avatar_url: true } },
        topic: true,
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async getArticleVersions(article_id: string) {
    return prisma.version.findMany({
      where: { article_id: article_id },
      orderBy: { version: 'desc' },
    });
  }

  private async processArticleImages(
    content: string,
    images: Express.Multer.File[]
  ): Promise<string> {
    let processedContent = content;
    for (const image of images) {
      const imageUrl = await uploadToCloudinary(image, 'articles');
      processedContent = processedContent.replace(
        `[image:${image.originalname}]`,
        `![${image.originalname}](${imageUrl})`
      );
    }
    return processedContent;
  }

  async getLatestVersion(article_id: string): Promise<number> {
    const latestVersion = await prisma.version.findFirst({
      where: { article_id: article_id },
      orderBy: { version: 'desc' },
    });
    return latestVersion?.version ?? 0;
  }

  private async trackSubmission(
    author_id: string,
    article_id: string
  ): Promise<void> {
    try {
      await prisma.submissionLog.create({
        data: { author_id: author_id, article_id: article_id, type: 'article' },
      });
    } catch (error) {
      logger.error('Error tracking submission:', error);
    }
  }

  private async notifyAuthor(article: Article): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          user_id: article.author_id,
          title: 'Article Review Update',
          message: `Your article "${article.title}" has been ${article.status}`,
          type: 'system',
          link: `/articles/${article.id}`,
        },
      });
    } catch (error) {
      logger.error('Error notifying author:', error);
    }
  }

  async getPendingContent(type?: string, page = 1, limit = 10) {
    const where = {
      status: 'pending' as Status,
      ...(type && { type }),
    };

    const [content, total] = await Promise.all([
      this.findMany({
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
      this.count({ where }),
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

  async moderateContent(params: {
    content_id: string;
    content_type: 'article' | 'comment' | 'forumPost';
    status: Status;
    moderations: ContentModeration[];
    moderator_id: string;
  }) {
    const { content_id, content_type, status, moderations, moderator_id } =
      params;

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
          throw createAppError('Invalid content type', 400);
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

  async reportContent(params: {
    content_id: string;
    content_type: string;
    reporter_id: string;
    reason: string;
    details?: string;
  }) {
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
      await this.escalateContent(content_id, content_type);
    }

    return report;
  }

  async getReportedContent(status?: string, page = 1, limit = 10) {
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

  async getModerationLogs(content_id?: string, page = 1, limit = 10) {
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

  async autoModerateContent(content: string): Promise<boolean> {
    return ContentFilter.validateContent(content);
  }

  private async escalateContent(contentId: string, contentType: string) {
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
  }
}
