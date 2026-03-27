import { BaseRouter } from './BaseRouter';
import RBACController from '../controllers/rbacController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

export class RBACRoutes extends BaseRouter {
  private readonly rbacController: RBACController;

  constructor() {
    super();
    this.rbacController = new RBACController();
  }

  protected initializeRoutes(): void {
    // Role Management Routes — ADMIN only
    this.router.post(
      '/roles',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.createRole
    );

    this.router.patch(
      '/roles/:roleId',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.updateRole
    );

    this.router.delete(
      '/roles/:roleId',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.deleteRole
    );

    this.router.get(
      '/roles/:roleId/hierarchy',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.getRoleHierarchy
    );

    // Permission Management Routes — ADMIN only
    this.router.post(
      '/permissions',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.createPermission
    );

    this.router.patch(
      '/permissions/:permissionId',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.updatePermission
    );

    this.router.delete(
      '/permissions/:permissionId',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.deletePermission
    );

    // Access Control Routes — ADMIN only (assigning roles is a privileged operation)
    this.router.post(
      '/users/role',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.assignRoleToUser
    );

    // Any authenticated user may check their own permissions
    this.router.get(
      '/check-permission',
      authMiddleware,
      this.rbacController.checkPermission
    );
  }
}

export default new RBACRoutes().getRouter();
