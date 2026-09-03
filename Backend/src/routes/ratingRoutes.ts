import { BaseRouter } from './BaseRouter.js';
import RatingController from '../controllers/ratingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class RatingRoutes extends BaseRouter {
  private readonly controller: RatingController;

  constructor() {
    super();
    this.controller = new RatingController();
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    this.router.get('/me', authMiddleware, this.controller.getMyRating);
    // Public on purpose. The landing page renders the top players from this
    // endpoint instead of a placeholder podium, and a leaderboard that only
    // the already-signed-in can see is not a leaderboard. It exposes username,
    // display name and rating — the same fields every battle participant
    // already sees about every opponent — and nothing else (creatorSelect in
    // the controller has no email, no id beyond the public one).
    this.router.get('/leaderboard', this.controller.getRatingLeaderboard);
  }
}

export default new RatingRoutes().getRouter();
