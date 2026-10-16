import { Prisma, Article } from '@prisma/client';
import { Status } from '../constants/enums';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import BaseRepository from './baseRepository.js';
import { ArticleFilters } from '../types/index.js';
import { uploadToCloudinary } from '../utils/cloudinary';

import prisma from '../lib/prisma.js';

export class ArticleRepository extends BaseRepository<
  Article,
  typeof prisma.article
> {
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

  // The public listing. A list projection (no `content`) and one page at a
  // time: the unprojected, unpaginated version returned every approved article
  // in full — 3.3 MB uncompressed in one anonymous response.
  async listPublishedArticles(params: {
    search?: string;
    limit: number;
    offset: number;
  }) {
    const where: Prisma.ArticleWhereInput = { status: Status.APPROVED };
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { content: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          created_at: true,
          author: { select: { username: true } },
        },
        orderBy: { created_at: 'desc' },
        take: params.limit,
        skip: params.offset,
      }),
      prisma.article.count({ where }),
    ]);
    return { items, total };
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
        // Respect an explicit status (the status endpoint sets APPROVED/REJECTED);
        // a plain content edit (no status) defaults back to PENDING for re-review.
        status: (data.status as Status) ?? Status.PENDING,
      },
      include: {
        author: { select: { username: true, avatar_url: true } },
        topic: true,
      },
    });
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
}
