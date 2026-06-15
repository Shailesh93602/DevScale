import { Prisma } from '@prisma/client';
import { Status } from '../constants/enums';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import { ArticleRepository } from '../repositories/articleRepository';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';

export default class ArticleController {
  private readonly articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  // Public listing — force APPROVED so a client can't pass ?status=PENDING to
  // see unpublished/draft articles. (Moderators use getModerationQueue instead.)
  public getArticles = catchAsync(async (req: Request, res: Response) => {
    try {
      const { search } = req.query as { search?: string };

      const articles = await this.articleRepository.getArticles({
        status: Status.APPROVED,
        search,
      });
      sendResponse(res, 'ARTICLE_FETCHED', { data: articles });
    } catch (error) {
      logger.error('Failed to retrieve articles:', error);
      sendResponse(res, 'ARTICLE_NOT_FOUND', {
        error: 'Failed to retrieve articles',
      });
    }
  });

  // Moderation queue — articles awaiting review. Gated to ADMIN + MODERATOR at
  // the route. Optional ?status= overrides the default PENDING.
  public getModerationQueue = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { status, search } = req.query as {
          status?: Status;
          search?: string;
        };
        const articles = await this.articleRepository.getArticles({
          status: status ?? Status.PENDING,
          search,
        });
        sendResponse(res, 'ARTICLE_FETCHED', { data: articles });
      } catch (error) {
        logger.error('Failed to retrieve moderation queue:', error);
        sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Failed to retrieve moderation queue',
        });
      }
    }
  );

  public updateArticleStatus = catchAsync(
    async (req: Request, res: Response) => {
      try {
        // Body params (validated by updateArticleStatusSchema). This previously
        // read req.query.id/status — always undefined for this POST — and used a
        // bogus APPROVED/REJECTED whitelist that didn't match the Status enum, so
        // the endpoint always 404'd. Status is already validated to the enum.
        const { articleId, status } = req.body as {
          articleId: string;
          status: Status;
        };

        const article = await this.articleRepository.getArticleById(articleId);
        if (!article) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Article not found',
          });
        }

        const updatedArticle = await this.articleRepository.updateArticle(
          articleId,
          { status }
        );
        sendResponse(res, 'ARTICLE_UPDATED', { data: updatedArticle });
      } catch (error) {
        logger.error('Failed to update article status:', error);
        sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Failed to update article status',
        });
      }
    }
  );

  public updateArticleContent = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const title = req.body.title ? sanitizeText(req.body.title) : undefined;
        const content = req.body.content
          ? sanitizeRichText(req.body.content)
          : undefined;

        if (!title && !content) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Please provide either title or content to update.',
          });
        }

        const article = await this.articleRepository.getArticleById(id);
        if (!article) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Article not found',
          });
        }

        const updatedArticle = await this.articleRepository.updateArticle(id, {
          title,
          content,
        });
        sendResponse(res, 'ARTICLE_UPDATED', { data: updatedArticle });
      } catch (error) {
        logger.error('Failed to update article content:', error);
        sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Failed to update article content',
        });
      }
    }
  );

  // Author submits a new article → status PENDING → appears in /moderate queue.
  // Any authenticated user can submit; content is sanitized (XSS-safe).
  public createArticle = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw createAppError('Authentication required', 401);
    }
    const { topic_id, tags } = req.body as { topic_id: string; tags?: string[] };
    const title = sanitizeText(req.body.title);
    const content = sanitizeRichText(req.body.content);

    const article = await this.articleRepository.submitArticle({
      title,
      content,
      author_id: userId,
      topic_id,
      tags,
    });
    sendResponse(res, 'ARTICLE_CREATED', { data: article });
  });

  public getArticleById = catchAsync(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await this.articleRepository.getArticleById(id);
      if (!article) {
        return sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Article not found',
        });
      }
      sendResponse(res, 'ARTICLE_FETCHED', { data: article });
    } catch (error) {
      logger.error('Failed to retrieve article:', error);
      sendResponse(res, 'ARTICLE_NOT_FOUND', {
        error: 'Failed to retrieve article',
      });
    }
  });

  public updateModerationNotes = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { notes, action } = req.body;
        const moderator_id = req.user?.id;

        if (!notes || !action) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Notes and action are required',
          });
        }

        if (!moderator_id) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Moderator ID is required',
          });
        }

        const article = await this.articleRepository.getArticleById(id);
        if (!article) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Article not found',
          });
        }

        const updatedArticle = await this.articleRepository.updateArticle(id, {
          moderations: {
            create: [
              {
                content_type: 'ARTICLE',
                action,
                notes,
                moderator_id,
              },
            ],
          },
        });

        sendResponse(res, 'ARTICLE_UPDATED', { data: updatedArticle });
      } catch (error) {
        logger.error('Failed to update moderation notes:', error);
        sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Failed to update moderation notes',
        });
      }
    }
  );

  public getMyArticles = catchAsync(async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'User ID not found',
        });
      }
      const articles = await this.articleRepository.getArticles({
        author_id: userId,
      });
      sendResponse(res, 'ARTICLE_FETCHED', { data: articles });
    } catch (error) {
      logger.error('Failed to retrieve articles:', error);
      sendResponse(res, 'ARTICLE_NOT_FOUND', {
        error: 'Failed to retrieve articles',
      });
    }
  });

  public getArticleComments = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const article = (await this.articleRepository.getArticleById(
          id
        )) as Prisma.ArticleInclude;
        if (!article) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Article not found',
          });
        }
        sendResponse(res, 'ARTICLE_FETCHED', { data: article.moderations });
      } catch (error) {
        logger.error('Failed to retrieve article comments:', error);
        sendResponse(res, 'ARTICLE_NOT_FOUND', {
          error: 'Failed to retrieve article comments',
        });
      }
    }
  );
}
