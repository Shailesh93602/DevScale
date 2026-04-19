import { BaseRouter } from './BaseRouter';
import CommunityForumController from '../controllers/communityForumControllers';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import {
  createForumSchema,
  updateForumSchema,
} from '../validations/forumValidations';

export class CommunityForumRoutes extends BaseRouter {
  private readonly communityForumController: CommunityForumController;

  constructor() {
    super();
    this.communityForumController = new CommunityForumController();
    this.router.use(authMiddleware);
  }
  protected initializeRoutes(): void {
    this.router.get('/', this.communityForumController.getForums);
    this.router.get('/:id', this.communityForumController.getForum);
    this.router.post(
      '/create',
      validateRequest(createForumSchema),
      this.communityForumController.createForum
    );
    this.router.put(
      '/update/:id',
      validateRequest(updateForumSchema),
      this.communityForumController.updateForum
    );
    // Deleting a forum is destructive and permanent — admin only
    this.router.delete(
      '/delete/:id',
      authorizeRoles('ADMIN'),
      this.communityForumController.deleteForum
    );
  }
}

export default new CommunityForumRoutes().getRouter();
