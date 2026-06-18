import { BaseRouter } from './BaseRouter';
import ResourceController from '../controllers/resourceController';
import paginationMiddleware from '../middlewares/paginationMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createResourceValidation,
  saveResourceValidation,
} from '../validations/resourceValidations';

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
    this.router.post(
      '/create',
      validateRequest(createResourceValidation),
      this.resourceController.createResource
    );
    this.router.post(
      '/save/:id',
      validateRequest(saveResourceValidation),
      this.resourceController.saveResource
    );
  }
}
