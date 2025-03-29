import { BaseRouter } from './BaseRouter';
import CommunityForumController from '../controllers/communityForumControllers';
import { authMiddleware } from '../middlewares/authMiddleware';

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
    this.router.post('/create', this.communityForumController.createForum);
    this.router.put('/update/:id', this.communityForumController.updateForum);
    this.router.delete(
      '/delete/:id',
      this.communityForumController.deleteForum
    );
  }
}

export default new CommunityForumRoutes().getRouter();
