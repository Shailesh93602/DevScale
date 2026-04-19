import UserController from '../controllers/userControllers';
import {
  userInsertionSchema,
  insertUserRoadmapSchema,
} from '../validations/userValidations';
import { validateRequest } from '../middlewares/validateRequest';

import { BaseRouter } from './BaseRouter';
import { authMiddleware } from '../middlewares/authMiddleware';
export class UserRoutes extends BaseRouter {
  private readonly userController: UserController;

  constructor() {
    super();
    this.userController = new UserController();
  }

  protected initializeRoutes(): void {
    this.router.get('/me', authMiddleware, this.userController.getProfile);

    this.router.put(
      '/me',
      authMiddleware,
      validateRequest(userInsertionSchema),
      this.userController.upsertUser
    );

    this.router.get(
      '/progress',
      authMiddleware,
      this.userController.getUserProgress
    );
    this.router.get(
      '/roadmap',
      authMiddleware,
      this.userController.getUserRoadmap
    );
    this.router.post(
      '/roadmap',
      authMiddleware,
      validateRequest(insertUserRoadmapSchema),
      this.userController.insertUserRoadmap
    );
    this.router.delete(
      '/roadmap/:id',
      authMiddleware,
      this.userController.deleteUserRoadmap
    );
    this.router.get(
      '/check-username',
      authMiddleware,
      this.userController.checkUsername
    );
  }
}
