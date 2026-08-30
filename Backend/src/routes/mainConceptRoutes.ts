import { BaseRouter } from './BaseRouter';
import MainConceptController from '../controllers/mainConceptController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

export class MainConceptRoutes extends BaseRouter {
  private readonly mainConceptController: MainConceptController;

  constructor() {
    super();
    this.mainConceptController = new MainConceptController();
    // NOT initializeRoutes() here: BaseRouter.getRouter() calls it. Doing both
    // registered every route twice, so each request ran its handler chain twice.
  }

  public initializeRoutes(): void {
    // Public routes
    this.router.get('/', this.mainConceptController.getAllMainConcepts);
    // /:id/subjects must be before /:id to avoid param collision
    this.router.get(
      '/:id/subjects',
      this.mainConceptController.getSubjectsInMainConcept
    );
    this.router.get('/:id', this.mainConceptController.getMainConceptById);

    // Protected routes.
    //
    // These said "Protected" and carried NO middleware at all — DELETE /:id was
    // unauthenticated curriculum deletion, reachable by anyone on the internet.
    // Curriculum is admin-owned content, so the guard is ADMIN, not merely
    // authenticated: every student is authenticated.
    this.router.post(
      '/',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.mainConceptController.createMainConcept
    );
    this.router.post(
      '/with-subjects',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.mainConceptController.createMainConceptWithSubjects
    );
    this.router.put(
      '/:id',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.mainConceptController.updateMainConcept
    );
    this.router.delete(
      '/:id',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.mainConceptController.deleteMainConcept
    );
  }
}

// Create and export an instance of the routes
export default new MainConceptRoutes().getRouter();
