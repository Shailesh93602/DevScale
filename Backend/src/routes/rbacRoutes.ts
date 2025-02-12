import { Router } from 'express';
import { RBACController } from '../controllers/rbacController';
import { authenticateUser } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Role Management Routes
router.post(
  '/roles',
  authenticateUser,
  requirePermission('roles', 'create'),
  RBACController.createRole
);

router.patch(
  '/roles/:roleId',
  authenticateUser,
  requirePermission('roles', 'update'),
  RBACController.updateRole
);

router.delete(
  '/roles/:roleId',
  authenticateUser,
  requirePermission('roles', 'delete'),
  RBACController.deleteRole
);

router.get(
  '/roles/:roleId/hierarchy',
  authenticateUser,
  requirePermission('roles', 'read'),
  RBACController.getRoleHierarchy
);

// Permission Management Routes
router.post(
  '/permissions',
  authenticateUser,
  requirePermission('permissions', 'create'),
  RBACController.createPermission
);

router.patch(
  '/permissions/:permissionId',
  authenticateUser,
  requirePermission('permissions', 'update'),
  RBACController.updatePermission
);

router.delete(
  '/permissions/:permissionId',
  authenticateUser,
  requirePermission('permissions', 'delete'),
  RBACController.deletePermission
);

// Access Control Routes
router.post(
  '/users/role',
  authenticateUser,
  requirePermission('roles', 'assign'),
  RBACController.assignRoleToUser
);

router.get(
  '/check-permission',
  authenticateUser,
  RBACController.checkPermission
);

export default router;
