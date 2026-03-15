import { BaseRouter } from './BaseRouter';
import CodeController from '../controllers/codeController';
import { validateRequest } from '../middlewares/validateRequest';
import { runCodeValidation, saveDraftValidation } from '../validations/challengeValidation';
import { authMiddleware } from '../middlewares/authMiddleware';

export class CodeRoutes extends BaseRouter {
  private readonly codeController: CodeController;

  constructor() {
    super();
    this.codeController = new CodeController();
  }

  protected initializeRoutes(): void {
    this.router.post(
      '/',
      validateRequest(runCodeValidation),
      this.codeController.runCode
    );

    this.router.post(
      '/draft',
      authMiddleware,
      validateRequest(saveDraftValidation),
      this.codeController.saveDraft
    );

    this.router.get(
      '/draft/:challengeId',
      authMiddleware,
      this.codeController.getDraft
    );
  }
}

export default new CodeRoutes().getRouter();
