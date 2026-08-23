import { BaseRouter } from './BaseRouter.js';
import TutorController from '../controllers/tutorController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class TutorRoutes extends BaseRouter {
  private readonly controller: TutorController;

  constructor() {
    super();
    this.controller = new TutorController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    this.router.post('/ask', this.controller.ask);
    this.router.post('/hint', this.controller.hint);
  }
}

export default new TutorRoutes().getRouter();
