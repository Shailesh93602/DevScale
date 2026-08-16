import { BaseRouter } from './BaseRouter';
import CodeController from '../controllers/codeController';
import { validateRequest } from '../middlewares/validateRequest';
import {
  runCodeValidation,
  saveDraftValidation,
} from '../validations/challengeValidation';
import { authMiddleware } from '../middlewares/authMiddleware';

export class CodeRoutes extends BaseRouter {
  private readonly codeController: CodeController;

  constructor() {
    super();
    this.codeController = new CodeController();
  }

  protected initializeRoutes(): void {
    // Every call here forwards to Judge0, which is metered and billed. Left
    // unauthenticated this is a free compute faucet for anyone who finds the
    // route (and a way to burn the RapidAPI quota the editor depends on).
    this.router.post(
      '/',
      authMiddleware,
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
