import { BaseRouter } from './BaseRouter.js';
import RecommendationController from '../controllers/recommendationController.js';
import {
  authMiddleware,
  authorizeRoles,
} from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class RecommendationRoutes extends BaseRouter {
  private readonly controller: RecommendationController;

  constructor() {
    super();
    this.controller = new RecommendationController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    // Personalized recommendations for the signed-in learner.
    this.router.get(
      '/challenges',
      this.controller.getChallengeRecommendations
    );
    // Admin-only: backfill challenge embeddings.
    this.router.post(
      '/admin/reindex-challenges',
      authorizeRoles('ADMIN'),
      this.controller.reindexChallenges
    );
  }
}

export default new RecommendationRoutes().getRouter();
