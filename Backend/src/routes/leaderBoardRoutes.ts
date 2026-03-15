import { BaseRouter } from './BaseRouter';
import loaderBoardController from '../controllers/leaderBoardControllers';
import { authMiddleware } from '../middlewares/authMiddleware';

export class LeaderboardRoutes extends BaseRouter {
  private readonly loaderBoardController: loaderBoardController;

  constructor() {
    super();
    this.loaderBoardController = new loaderBoardController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.loaderBoardController.getLeaderboardEntries);
  }
}

export default new LeaderboardRoutes().getRouter();
