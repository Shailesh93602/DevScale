import { Router } from 'express';
import { RBACController } from '../controllers/rbacController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();

// Role Management Routes
router.post(
  '/roles',
  authMiddleware,
  requirePermission('roles', 'create'),
  RBACController.createRole
);

router.patch(
  '/roles/:roleId',
  authMiddleware,
  requirePermission('roles', 'update'),
  RBACController.updateRole
);

router.delete(
  '/roles/:roleId',
  authMiddleware,
  requirePermission('roles', 'delete'),
  RBACController.deleteRole
);

router.get(
  '/roles/:roleId/hierarchy',
  authMiddleware,
  requirePermission('roles', 'read'),
  RBACController.getRoleHierarchy
);

// Permission Management Routes
router.post(
  '/permissions',
  authMiddleware,
  requirePermission('permissions', 'create'),
  RBACController.createPermission
);

router.patch(
  '/permissions/:permissionId',
  authMiddleware,
  requirePermission('permissions', 'update'),
  RBACController.updatePermission
);

router.delete(
  '/permissions/:permissionId',
  authMiddleware,
  requirePermission('permissions', 'delete'),
  RBACController.deletePermission
);

// Access Control Routes
router.post(
  '/users/role',
  authMiddleware,
  requirePermission('roles', 'assign'),
  RBACController.assignRoleToUser
);

router.get('/check-permission', authMiddleware, RBACController.checkPermission);

export default router;
