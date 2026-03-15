import { BaseRouter } from './BaseRouter';
import MainConceptController from '../controllers/mainConceptController';

export class MainConceptRoutes extends BaseRouter {
  private readonly mainConceptController: MainConceptController;

  constructor() {
    super();
    this.mainConceptController = new MainConceptController();
    this.initializeRoutes();
  }

  public initializeRoutes(): void {
    // Public routes
    this.router.get('/', this.mainConceptController.getAllMainConcepts);
    this.router.get('/:id', this.mainConceptController.getMainConceptById);

    // Protected routes
    this.router.post('/', this.mainConceptController.createMainConcept);
    this.router.post(
      '/with-subjects',
      this.mainConceptController.createMainConceptWithSubjects
    );
    this.router.put('/:id', this.mainConceptController.updateMainConcept);
    this.router.delete('/:id', this.mainConceptController.deleteMainConcept);
  }
}

// Create and export an instance of the routes
export default new MainConceptRoutes().getRouter();
