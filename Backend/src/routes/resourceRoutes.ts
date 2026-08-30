import { BaseRouter } from './BaseRouter';
import ResourceController from '../controllers/resourceController';
import paginationMiddleware from '../middlewares/paginationMiddleware';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
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
    // Curriculum mutations, not user content. deleteSubjects runs
    // `deleteMany({ id: { in: ids } })` on caller-supplied ids, so router-level
    // authMiddleware alone let any signed-in student wipe the curriculum.
    this.router.post(
      '/create-subject',
      authorizeRoles('ADMIN'),
      this.resourceController.createSubjects
    );
    this.router.post(
      '/delete-subjects',
      authorizeRoles('ADMIN'),
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
