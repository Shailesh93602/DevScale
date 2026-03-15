import { BaseRouter } from './BaseRouter';
import ArticleController from '../controllers/articleController';

export class ArticleRoutes extends BaseRouter {
  private readonly articleController: ArticleController;

  constructor() {
    super();
    this.articleController = new ArticleController();
  }

  protected initializeRoutes(): void {
    this.router.get('/all', this.articleController.getArticles);
    this.router.post('/status', this.articleController.updateArticleStatus);
    this.router.post(
      '/:id/moderation',
      this.articleController.updateModerationNotes
    );
    this.router.get('/my-articles', this.articleController.getMyArticles);
    this.router.get('/:id/comments', this.articleController.getArticleComments);
    this.router.post(
      '/:id/update',
      this.articleController.updateArticleContent
    );
    this.router.get('/:id', this.articleController.getArticleById);
  }
}

export default new ArticleRoutes().getRouter();
