import { BaseRouter } from './BaseRouter';
import BattleController from '../controllers/battleControllers';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createBattleValidationSchema,
  updateBattleValidationSchema,
  battleIdValidation,
  joinBattleValidationSchema,
  submitAnswerValidationSchema,
  battleLeaderboardValidationSchema,
  updateBattleStatusValidationSchema,
  rescheduleBattleValidationSchema,
} from '../validations/battleValidations';
import { authMiddleware } from '../middlewares/authMiddleware';

export class BattleRoutes extends BaseRouter {
  private readonly battleController: BattleController;

  constructor() {
    super();
    this.battleController = new BattleController();
  }

  protected initializeRoutes(): void {
    // Public routes (no authentication required)
    this.router.get('/', this.battleController.getBattles);
    this.router.get('/:id', this.battleController.getBattle);
    this.router.get(
      '/:id/leaderboard',
      this.battleController.getBattleLeaderboard
    );

    // Protected routes (authentication required)
    this.router.post(
      '/create',
      authMiddleware,
      validateRequest(createBattleValidationSchema),
      this.battleController.createBattle
    );

    this.router.put(
      '/:id',
      authMiddleware,
      validateRequest(updateBattleValidationSchema),
      this.battleController.updateBattle
    );

    this.router.delete(
      '/:id',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.battleController.deleteBattle
    );

    // Battle participation routes
    this.router.post(
      '/:id/join',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.battleController.joinBattle
    );

    this.router.get(
      '/:id/questions',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.battleController.getBattleQuestions
    );

    this.router.post(
      '/submit',
      authMiddleware,
      validateRequest(submitAnswerValidationSchema),
      this.battleController.submitAnswer
    );

    this.router.patch(
      '/:id/join',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.battleController.joinBattle
    );

    this.router.patch(
      '/:id/status',
      authMiddleware,
      validateRequest(updateBattleStatusValidationSchema),
      this.battleController.updateBattleStatus
    );

    this.router.patch(
      '/:id/reschedule',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      validateRequest(rescheduleBattleValidationSchema),
      this.battleController.rescheduleBattle
    );

    this.router.patch(
      '/:id/archive',
      authMiddleware,
      validateRequest(battleIdValidation, 'params'),
      this.battleController.archiveBattle
    );
  }
}

export default new BattleRoutes().getRouter();
