import { BaseRouter } from './BaseRouter.js';
import RatingController from '../controllers/ratingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class RatingRoutes extends BaseRouter {
  private readonly controller: RatingController;

  constructor() {
    super();
    this.controller = new RatingController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    this.router.get('/me', this.controller.getMyRating);
    this.router.get('/leaderboard', this.controller.getRatingLeaderboard);
  }
}

export default new RatingRoutes().getRouter();
