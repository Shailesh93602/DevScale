"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACRoutes = void 0;
const BaseRouter_1 = require("./BaseRouter");
const rbacController_1 = __importDefault(require("../controllers/rbacController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
// import { requirePermission } from '../middlewares/rbacMiddleware';
class RBACRoutes extends BaseRouter_1.BaseRouter {
    rbacController;
    constructor() {
        super();
        this.rbacController = new rbacController_1.default();
    }
    initializeRoutes() {
        // Role Management Routes
        this.router.post('/roles', authMiddleware_1.authMiddleware, 
        // requirePermission('roles', 'create'),
        this.rbacController.createRole);
        this.router.patch('/roles/:roleId', authMiddleware_1.authMiddleware, 
        // requirePermission('roles', 'update'),
        this.rbacController.updateRole);
        this.router.delete('/roles/:roleId', authMiddleware_1.authMiddleware, 
        // requirePermission('roles', 'delete'),
        this.rbacController.deleteRole);
        this.router.get('/roles/:roleId/hierarchy', authMiddleware_1.authMiddleware, 
        // requirePermission('roles', 'read'),
        this.rbacController.getRoleHierarchy);
        // Permission Management Routes
        this.router.post('/permissions', authMiddleware_1.authMiddleware, 
        // requirePermission('permissions', 'create'),
        this.rbacController.createPermission);
        this.router.patch('/permissions/:permissionId', authMiddleware_1.authMiddleware, 
        // requirePermission('permissions', 'update'),
        this.rbacController.updatePermission);
        this.router.delete('/permissions/:permissionId', authMiddleware_1.authMiddleware, 
        // requirePermission('permissions', 'delete'),
        this.rbacController.deletePermission);
        // Access Control Routes
        this.router.post('/users/role', authMiddleware_1.authMiddleware, 
        // requirePermission('roles', 'assign'),
        this.rbacController.assignRoleToUser);
        this.router.get('/check-permission', authMiddleware_1.authMiddleware, this.rbacController.checkPermission);
    }
}
exports.RBACRoutes = RBACRoutes;
exports.default = new RBACRoutes().getRouter();
//# sourceMappingURL=rbacRoutes.js.map