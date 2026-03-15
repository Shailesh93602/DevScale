import { BaseRouter } from './BaseRouter';
import RBACController from '../controllers/rbacController';
import { authMiddleware } from '../middlewares/authMiddleware';
// import { requirePermission } from '../middlewares/rbacMiddleware';

export class RBACRoutes extends BaseRouter {
  private readonly rbacController: RBACController;

  constructor() {
    super();
    this.rbacController = new RBACController();
  }

  protected initializeRoutes(): void {
    // Role Management Routes
    this.router.post(
      '/roles',
      authMiddleware,
      // requirePermission('roles', 'create'),
      this.rbacController.createRole
    );

    this.router.patch(
      '/roles/:roleId',
      authMiddleware,
      // requirePermission('roles', 'update'),
      this.rbacController.updateRole
    );

    this.router.delete(
      '/roles/:roleId',
      authMiddleware,
      // requirePermission('roles', 'delete'),
      this.rbacController.deleteRole
    );

    this.router.get(
      '/roles/:roleId/hierarchy',
      authMiddleware,
      // requirePermission('roles', 'read'),
      this.rbacController.getRoleHierarchy
    );

    // Permission Management Routes
    this.router.post(
      '/permissions',
      authMiddleware,
      // requirePermission('permissions', 'create'),
      this.rbacController.createPermission
    );

    this.router.patch(
      '/permissions/:permissionId',
      authMiddleware,
      // requirePermission('permissions', 'update'),
      this.rbacController.updatePermission
    );

    this.router.delete(
      '/permissions/:permissionId',
      authMiddleware,
      // requirePermission('permissions', 'delete'),
      this.rbacController.deletePermission
    );

    // Access Control Routes
    this.router.post(
      '/users/role',
      authMiddleware,
      // requirePermission('roles', 'assign'),
      this.rbacController.assignRoleToUser
    );

    this.router.get(
      '/check-permission',
      authMiddleware,
      this.rbacController.checkPermission
    );
  }
}

export default new RBACRoutes().getRouter();
