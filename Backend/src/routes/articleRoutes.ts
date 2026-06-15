import { BaseRouter } from './BaseRouter';
import ArticleController from '../controllers/articleController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  updateArticleStatusSchema,
  updateModerationNotesSchema,
  updateArticleContentSchema,
  articleIdParamSchema,
} from '../validations/articleValidations';

export class ArticleRoutes extends BaseRouter {
  private readonly articleController: ArticleController;

  constructor() {
    super();
    this.articleController = new ArticleController();
  }

  protected initializeRoutes(): void {
    // Public reads. NOTE: literal paths (/all, /my-articles) MUST be registered
    // before the '/:id' param route, otherwise Express matches '/:id' first and
    // e.g. /my-articles is read as id="my-articles" → 404.
    this.router.get('/all', this.articleController.getArticles);

    // Authenticated — own articles (literal path, before '/:id')
    this.router.get(
      '/my-articles',
      authMiddleware,
      this.articleController.getMyArticles
    );

    // Moderation queue (ADMIN + MODERATOR) — literal path, before '/:id'.
    this.router.get(
      '/moderation/queue',
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      this.articleController.getModerationQueue
    );

    this.router.get('/:id', this.articleController.getArticleById);
    this.router.get('/:id/comments', this.articleController.getArticleComments);

    // Admin/moderator only — content writes
    this.router.post(
      '/status',
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(updateArticleStatusSchema),
      this.articleController.updateArticleStatus
    );
    this.router.post(
      '/:id/moderation',
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(articleIdParamSchema, 'params'),
      validateRequest(updateModerationNotesSchema),
      this.articleController.updateModerationNotes
    );
    this.router.post(
      '/:id/update',
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(articleIdParamSchema, 'params'),
      validateRequest(updateArticleContentSchema),
      this.articleController.updateArticleContent
    );
  }
}

export default new ArticleRoutes().getRouter();
