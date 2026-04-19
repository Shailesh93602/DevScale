import { Prisma, Status } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { ArticleRepository } from '../repositories/articleRepository';
import { sanitizeText, sanitizeRichText } from '../utils/sanitize';

export default class ArticleController {
  private readonly articleRepository: ArticleRepository;

  constructor() {
    this.articleRepository = new ArticleRepository();
  }

  public getArticles = catchAsync(async (req: Request, res: Response) => {
    try {
      const { status, search } = req.query as {
        status?: Status;
        search?: string;
      };

      const articles = await this.articleRepository.getArticles({
        status,
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

  public updateArticleStatus = catchAsync(
    async (req: Request, res: Response) => {
      try {
        const { id, status } = req.query as {
          id: string;
          status: Status;
        };

        if (!['APPROVED', 'REJECTED'].includes(status)) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Invalid status value. Please use APPROVED or REJECTED.',
          });
        }

        const article = await this.articleRepository.getArticleById(id);
        if (!article) {
          return sendResponse(res, 'ARTICLE_NOT_FOUND', {
            error: 'Article not found',
          });
        }

        const updatedArticle = await this.articleRepository.updateArticle(id, {
          status,
        });
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
