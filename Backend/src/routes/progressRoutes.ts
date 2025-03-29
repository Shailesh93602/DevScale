import { BaseRouter } from './BaseRouter';
import UserProgressController from '../controllers/userProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { updateProgressValidation } from '../validations/progressValidation';

export class ProgressRoutes extends BaseRouter {
  private readonly progressController: UserProgressController;

  constructor() {
    super();
    this.progressController = new UserProgressController();
    this.router.use(authMiddleware);
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.progressController.getProgress);
    this.router.post(
      '/update',
      validateRequest(updateProgressValidation),
      this.progressController.updateProgress
    );
  }
}

export default new ProgressRoutes().getRouter();
