import { BaseRouter } from './BaseRouter';
import ChallengeController from '../controllers/challengeController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { camelCaseResponse } from '../middlewares/responseTransformer';
import {
  createChallengeValidation,
  submitChallengeValidation,
} from '../validations/challengeValidation';

export class ChallengeRoutes extends BaseRouter {
  private readonly challengeController: ChallengeController;

  constructor() {
    super();
    this.challengeController = new ChallengeController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    // Public routes
    this.router.get('/', this.challengeController.getChallenges);
    this.router.get(
      '/leaderboard',
      this.challengeController.getChallengeLeaderboard
    );
    this.router.get('/:id', this.challengeController.getChallenge);

    // Protected routes
    this.router.post(
      '/',
      // authorizeRoles('admin', 'instructor'),
      validateRequest(createChallengeValidation),
      this.challengeController.createNewChallenge
    );

    this.router.patch(
      '/:id',
      // authorizeRoles('admin', 'instructor'),
      validateRequest(createChallengeValidation),
      this.challengeController.updateExistingChallenge
    );

    this.router.post(
      '/:challengeId/submit',
      validateRequest(submitChallengeValidation),
      this.challengeController.submitChallengeAttempt
    );
  }
}

export default new ChallengeRoutes().getRouter();
