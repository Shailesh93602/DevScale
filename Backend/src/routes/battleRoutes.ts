import { BaseRouter } from './BaseRouter';
import BattleController from '../controllers/battleControllers';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createBattleValidationSchema,
  battleIdValidation,
  submitAnswerValidationSchema,
  addQuestionsValidationSchema,
  questionPoolQuerySchema,
} from '../validations/battleValidations';
import { authMiddleware } from '../middlewares/authMiddleware';
import { battleAntiCheatMiddleware } from '../middlewares/battleAntiCheatMiddleware';
import { battleParticipantMiddleware } from '../middlewares/battleParticipantMiddleware';
import {
  battleCreationLimiter,
  battleJoinLimiter,
  battleSubmissionLimiter,
} from '../middlewares/battleRateLimiter';

export class BattleRoutes extends BaseRouter {
  private readonly ctrl: BattleController;

  constructor() {
    super();
    this.ctrl = new BattleController();
  }

  protected initializeRoutes(): void {
    // ── Public ────────────────────────────────────────────────────────────
    this.router.get('/', this.ctrl.getBattles);
    this.router.get('/global-stats', this.ctrl.getGlobalStats);  // before /:id
    this.router.get('/my', authMiddleware, this.ctrl.getMyBattles);
    this.router.get('/statistics/me', authMiddleware, this.ctrl.getStatistics);
    // question-pool must be before /:id to avoid Express matching 'question-pool' as a param
    this.router.get(
      '/question-pool',
      authMiddleware,
      validateRequest(questionPoolQuerySchema, 'query'),
      this.ctrl.getQuestionPool,
    );
    this.router.get('/:id', validateRequest(battleIdValidation, 'params'), this.ctrl.getBattle);
    this.router.get('/:id/leaderboard', validateRequest(battleIdValidation, 'params'), this.ctrl.getBattleLeaderboard);
    this.router.get('/:id/results', validateRequest(battleIdValidation, 'params'), this.ctrl.getBattleResults);
    this.router.get('/:id/my-results', authMiddleware, validateRequest(battleIdValidation, 'params'), this.ctrl.getMyResults);

    // ── Auth-required ─────────────────────────────────────────────────────
    this.router.get(
      '/:id/questions',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.getBattleQuestions
    );

    this.router.post(
      '/:id/questions',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      validateRequest(addQuestionsValidationSchema),
      this.ctrl.addBattleQuestions
    );

    this.router.post(
      '/',
      authMiddleware,
      battleCreationLimiter,
      validateRequest(createBattleValidationSchema),
      this.ctrl.createBattle
    );

    this.router.post(
      '/:id/join',
      authMiddleware,
      battleJoinLimiter,
      validateRequest(battleIdValidation, 'params'),
      battleParticipantMiddleware,
      this.ctrl.joinBattle
    );

    this.router.post(
      '/:id/leave',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.leaveBattle
    );

    this.router.post(
      '/:id/ready',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.markReady
    );

    this.router.post(
      '/:id/lobby',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.openLobby
    );

    this.router.post(
      '/:id/start',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.startBattle
    );

    this.router.patch(
      '/:id/cancel',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.ctrl.cancelBattle
    );

    this.router.post(
      '/answer',
      authMiddleware,
      battleSubmissionLimiter,
      battleAntiCheatMiddleware,
      validateRequest(submitAnswerValidationSchema),
      this.ctrl.submitAnswer
    );
  }
}

export default new BattleRoutes().getRouter();
