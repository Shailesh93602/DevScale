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
  }

  protected initializeRoutes(): void {
    // Public and registered BEFORE the router-level auth: it serves a static
    // JSON file, and /interview-question is a public, sitemapped page. Behind
    // auth it 401'd for every visitor, and before that the handler was not
    // mounted at all, so the path fell through to GET /:id.
    this.router.get(
      '/interview-questions',
      this.resourceController.getInterviewQuestions
    );
    this.router.use(authMiddleware);
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
