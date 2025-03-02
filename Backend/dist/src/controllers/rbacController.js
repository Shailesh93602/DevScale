"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACController = void 0;
const rbacService_1 = require("../services/rbacService");
const validateRequest_1 = require("../middlewares/validateRequest");
const rbacValidations_1 = require("../validations/rbacValidations");
class RBACController {
    static async createRole(req, res, next) {
        try {
            (0, validateRequest_1.validateRequest)(rbacValidations_1.roleSchema, req.body);
            const role = await (0, rbacService_1.createRole)(req.body);
            res.status(201).json({ success: true, data: role });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRole(req, res, next) {
        try {
            const { roleId } = req.params;
            (0, validateRequest_1.validateRequest)(rbacValidations_1.roleSchema, req.body);
            const role = await (0, rbacService_1.updateRole)(roleId, req.body);
            res.json({ success: true, data: role });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteRole(req, res, next) {
        try {
            const { roleId } = req.params;
            await (0, rbacService_1.deleteRole)(roleId);
            res.json({ success: true, message: 'Role deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async getRoleHierarchy(req, res, next) {
        try {
            const { roleId } = req.params;
            const hierarchy = await (0, rbacService_1.getRoleHierarchy)(roleId);
            res.json({ success: true, data: hierarchy });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPermission(req, res, next) {
        try {
            (0, validateRequest_1.validateRequest)(rbacValidations_1.permissionSchema, req.body);
            const permission = await (0, rbacService_1.createPermission)(req.body);
            res.status(201).json({ success: true, data: permission });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePermission(req, res, next) {
        try {
            const { permissionId } = req.params;
            (0, validateRequest_1.validateRequest)(rbacValidations_1.permissionSchema, req.body);
            const permission = await (0, rbacService_1.updatePermission)(permissionId, req.body);
            res.json({ success: true, data: permission });
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePermission(req, res, next) {
        try {
            const { permissionId } = req.params;
            await (0, rbacService_1.deletePermission)(permissionId);
            res.json({ success: true, message: 'Permission deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    static async assignRoleToUser(req, res, next) {
        try {
            (0, validateRequest_1.validateRequest)(rbacValidations_1.roleAssignmentSchema, req.body);
            const { userId, roleId } = req.body;
            const user = await (0, rbacService_1.assignRoleToUser)(userId, roleId);
            res.json({ success: true, data: user });
        }
        catch (error) {
            next(error);
        }
    }
    static async checkPermission(req, res, next) {
        try {
            const { userId, resource, action } = req.query;
            if (!userId || !resource || !action) {
                throw new Error('Missing required parameters');
            }
            const hasPermission = await (0, rbacService_1.checkPermission)(userId, resource, action);
            res.json({ success: true, data: { hasPermission } });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RBACController = RBACController;
//# sourceMappingURL=rbacController.js.map