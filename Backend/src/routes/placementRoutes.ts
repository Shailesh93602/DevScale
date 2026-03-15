import { BaseRouter } from './BaseRouter';
import PlacementController from '../controllers/placementControllers';

export class PlacementRoutes extends BaseRouter {
  private readonly placementController: PlacementController;

  constructor() {
    super();
    this.placementController = new PlacementController();
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    this.router.get('/resources', this.placementController.getResources);
    this.router.get('/books', this.placementController.getBooks);
  }
}

export default new PlacementRoutes().getRouter();
