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

    // ── Per-user permission overrides ────────────────────────────────────
    //
    // Managing who may do what is itself a privileged act, so these sit behind
    // roles:manage rather than a bare ADMIN check: the point of the whole
    // feature is that "who may do X" should be answerable per person, and that
    // has to include this.
    this.router.post(
      '/user-permissions',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.setUserPermission
    );

    this.router.delete(
      '/user-permissions',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.removeUserPermission
    );

    this.router.get(
      '/user-permissions/:userId',
      authMiddleware,
      authorizeRoles('ADMIN'),
      this.rbacController.getUserPermissions
    );
  }
}

export default new RBACRoutes().getRouter();
