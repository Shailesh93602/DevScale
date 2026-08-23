import { BaseRouter } from './BaseRouter.js';
import CodeReviewController from '../controllers/codeReviewController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

export class CodeReviewRoutes extends BaseRouter {
  private readonly controller: CodeReviewController;

  constructor() {
    super();
    this.controller = new CodeReviewController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    // Generate (or fetch the cached) AI review for the caller's own submission.
    this.router.post(
      '/challenge/:submissionId',
      this.controller.reviewChallengeSubmission
    );
  }
}

export default new CodeReviewRoutes().getRouter();
