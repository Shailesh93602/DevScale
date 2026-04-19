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
    // Public reads
    this.router.get('/all', this.articleController.getArticles);
    this.router.get('/:id', this.articleController.getArticleById);
    this.router.get('/:id/comments', this.articleController.getArticleComments);

    // Authenticated — own articles
    this.router.get(
      '/my-articles',
      authMiddleware,
      this.articleController.getMyArticles
    );

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
