import { BaseRouter } from './BaseRouter.js';
import MatchmakingController from '../controllers/matchmakingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class MatchmakingRoutes extends BaseRouter {
  private readonly controller: MatchmakingController;

  constructor() {
    super();
    this.controller = new MatchmakingController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    this.router.post('/join', this.controller.join);
    this.router.post('/leave', this.controller.leave);
    this.router.get('/status', this.controller.status);
  }
}

export default new MatchmakingRoutes().getRouter();
