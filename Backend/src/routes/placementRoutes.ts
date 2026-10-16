import { BaseRouter } from './BaseRouter';
import PlacementController from '../controllers/placementControllers';
import { authMiddleware } from '../middlewares/authMiddleware';

export class PlacementRoutes extends BaseRouter {
  private readonly placementController: PlacementController;

  constructor() {
    super();
    this.placementController = new PlacementController();
    // NOT initializeRoutes() here — BaseRouter.getRouter() calls it.
  }

  protected initializeRoutes(): void {
    // A user's own placement rows: the id comes from the session, never the
    // query (it used to be ?userId=, readable anonymously for anyone).
    this.router.get(
      '/resources',
      authMiddleware,
      this.placementController.getResources
    );
    this.router.get('/books', this.placementController.getBooks);
  }
}

export default new PlacementRoutes().getRouter();
