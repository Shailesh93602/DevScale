"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rbacController_1 = require("../controllers/rbacController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const rbacMiddleware_1 = require("../middlewares/rbacMiddleware");
const router = (0, express_1.Router)();
// Role Management Routes
router.post('/roles', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('roles', 'create'), rbacController_1.RBACController.createRole);
router.patch('/roles/:roleId', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('roles', 'update'), rbacController_1.RBACController.updateRole);
router.delete('/roles/:roleId', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('roles', 'delete'), rbacController_1.RBACController.deleteRole);
router.get('/roles/:roleId/hierarchy', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('roles', 'read'), rbacController_1.RBACController.getRoleHierarchy);
// Permission Management Routes
router.post('/permissions', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('permissions', 'create'), rbacController_1.RBACController.createPermission);
router.patch('/permissions/:permissionId', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('permissions', 'update'), rbacController_1.RBACController.updatePermission);
router.delete('/permissions/:permissionId', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('permissions', 'delete'), rbacController_1.RBACController.deletePermission);
// Access Control Routes
router.post('/users/role', authMiddleware_1.authMiddleware, (0, rbacMiddleware_1.requirePermission)('roles', 'assign'), rbacController_1.RBACController.assignRoleToUser);
router.get('/check-permission', authMiddleware_1.authMiddleware, rbacController_1.RBACController.checkPermission);
exports.default = router;
//# sourceMappingURL=rbacRoutes.js.map