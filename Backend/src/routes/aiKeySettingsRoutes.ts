import { BaseRouter } from './BaseRouter.js';
import AiKeyController from '../controllers/aiKeyController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { camelCaseResponse } from '../middlewares/responseTransformer.js';

/**
 * /settings/ai-key — a user managing their own AI provider credential.
 *
 * Every route is behind authMiddleware and every handler scopes its query by
 * `req.user.id`. There is deliberately no admin route to read another user's
 * key: the encryption is worth little if a privileged endpoint can undo it.
 */
export class AiKeySettingsRoutes extends BaseRouter {
  private readonly controller: AiKeyController;

  constructor() {
    super();
    this.controller = new AiKeyController();
    this.router.use(authMiddleware);
    this.router.use(camelCaseResponse);
  }

  protected initializeRoutes(): void {
    this.router.get('/ai-key', this.controller.get);
    this.router.put('/ai-key', this.controller.put);
    this.router.delete('/ai-key', this.controller.remove);
  }
}

export default new AiKeySettingsRoutes().getRouter();
