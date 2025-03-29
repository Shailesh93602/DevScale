import { BaseRouter } from './BaseRouter';
import ResourceController from '../controllers/resourceController';
import paginationMiddleware from '../middlewares/paginationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

export class ResourceRoutes extends BaseRouter {
  private readonly resourceController: ResourceController;

  constructor() {
    super();
    this.resourceController = new ResourceController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get(
      '/',
      paginationMiddleware,
      this.resourceController.getResources
    );
    this.router.get('/:id', this.resourceController.getResource);
    this.router.post('/create-subject', this.resourceController.createSubjects);
    this.router.post(
      '/delete-subjects',
      this.resourceController.deleteSubjects
    );
    this.router.get('/details/:id', this.resourceController.getResourceDetails);
    this.router.post('/create', this.resourceController.createResource);
    this.router.post('/save/:id', this.resourceController.saveResource);
  }
}
