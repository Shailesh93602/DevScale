import { BaseRouter } from './BaseRouter';
import ChallengeController from '../controllers/challengeController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
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
    // Static paths before /:id
    this.router.get(
      '/categories',
      this.challengeController.getChallengeCategories
    );
    this.router.get('/', this.challengeController.getChallenges);
    this.router.get(
      '/leaderboard',
      this.challengeController.getChallengeLeaderboard
    );
    this.router.get('/:id', this.challengeController.getChallenge);

    // Protected routes
    // 🔴 This guard was COMMENTED OUT. `authMiddleware` runs at the router
    // level, so the route was authenticated but not authorised — meaning any
    // signed-in student could create coding challenges.
    //
    // ADMIN and MODERATOR, not the original 'admin', 'instructor'. INSTRUCTOR
    // has never existed: the seeded roles are ADMIN, MODERATOR and STUDENT, so
    // naming it gated nothing and quietly implied a role model the app does not
    // have. (`authorizeRoles` compares case-insensitively, so the lowercase
    // 'admin' would have worked — that part was not the bug.)
    this.router.post(
      '/',
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(createChallengeValidation),
      this.challengeController.createNewChallenge
    );

    // The more serious of the two. A challenge's body includes its test cases,
    // so an ungated PATCH let any signed-in student rewrite the problem — or
    // the expected outputs — of a challenge other people are graded against.
    this.router.patch(
      '/:id',
      authorizeRoles('ADMIN', 'MODERATOR'),
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
