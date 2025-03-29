import { BaseRouter } from './BaseRouter';
import BattleController from '../controllers/battleControllers';
import { validateRequest } from '../middlewares/validateRequest';
import { createBattleValidationSchema } from '../validations/battleValidations';
import { authMiddleware } from '../middlewares/authMiddleware';

export class BattleRoutes extends BaseRouter {
  private readonly battleController: BattleController;

  constructor() {
    super();
    this.battleController = new BattleController();
  }

  protected initializeRoutes(): void {
    this.router.get('/', this.battleController.getBattles);
    this.router.get('/:id', this.battleController.getBattle);
    this.router.post(
      '/create',
      authMiddleware,
      validateRequest(createBattleValidationSchema),
      this.battleController.createBattle
    );
  }
}

export default new BattleRoutes().getRouter();
