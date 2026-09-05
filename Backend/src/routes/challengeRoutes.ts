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
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    // ── Anonymous reads ────────────────────────────────────────────────────
    // The LISTING is public by the owner's decision (2026-09-03): a visitor
    // may browse what challenges exist. Solving stays gated — GET /:id returns
    // the full problem body and test-case shape, POST /:challengeId/submit
    // writes an attempt — so those keep authMiddleware below. The controller
    // for the list never reads req.user, so there is nothing to personalise.
    //
    // authMiddleware used to be applied at the router level. It is now on each
    // route explicitly, so a new route added here is a deliberate choice
    // between the two groups rather than an accident either way.
    this.router.get(
      '/categories',
      this.challengeController.getChallengeCategories
    );
    this.router.get('/', this.challengeController.getChallenges);

    // ── Authenticated reads ────────────────────────────────────────────────
    this.router.get(
      '/leaderboard',
      authMiddleware,
      this.challengeController.getChallengeLeaderboard
    );
    this.router.get(
      '/:id',
      authMiddleware,
      this.challengeController.getChallenge
    );

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
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(createChallengeValidation),
      this.challengeController.createNewChallenge
    );

    // The more serious of the two. A challenge's body includes its test cases,
    // so an ungated PATCH let any signed-in student rewrite the problem — or
    // the expected outputs — of a challenge other people are graded against.
    this.router.patch(
      '/:id',
      authMiddleware,
      authorizeRoles('ADMIN', 'MODERATOR'),
      validateRequest(createChallengeValidation),
      this.challengeController.updateExistingChallenge
    );

    this.router.post(
      '/:challengeId/submit',
      authMiddleware,
      validateRequest(submitChallengeValidation),
      this.challengeController.submitChallengeAttempt
    );
  }
}

export default new ChallengeRoutes().getRouter();
