"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBACController = void 0;
const rbacService_1 = require("../services/rbacService");
const validateRequest_1 = require("../middlewares/validateRequest");
const rbacValidations_1 = require("../validations/rbacValidations");
const apiResponse_1 = require("../utils/apiResponse");
class RBACController {
    static async createRole(req, res, next) {
        try {
            (0, validateRequest_1.validateRequest)(rbacValidations_1.roleSchema, req.body);
            const role = await (0, rbacService_1.createRole)(req.body);
            (0, apiResponse_1.sendResponse)(res, 'ROLE_CREATED', { data: role });
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
            (0, apiResponse_1.sendResponse)(res, 'ROLE_UPDATED', { data: role });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteRole(req, res, next) {
        try {
            const { roleId } = req.params;
            await (0, rbacService_1.deleteRole)(roleId);
            (0, apiResponse_1.sendResponse)(res, 'ROLE_DELETED');
        }
        catch (error) {
            next(error);
        }
    }
    static async getRoleHierarchy(req, res, next) {
        try {
            const { roleId } = req.params;
            const hierarchy = await (0, rbacService_1.getRoleHierarchy)(roleId);
            (0, apiResponse_1.sendResponse)(res, 'ROLE_HIERARCHY_FETCHED', { data: hierarchy });
        }
        catch (error) {
            next(error);
        }
    }
    static async createPermission(req, res, next) {
        try {
            (0, validateRequest_1.validateRequest)(rbacValidations_1.permissionSchema, req.body);
            const permission = await (0, rbacService_1.createPermission)(req.body);
            (0, apiResponse_1.sendResponse)(res, 'PERMISSION_CREATED', { data: permission });
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
            (0, apiResponse_1.sendResponse)(res, 'PERMISSION_UPDATED', { data: permission });
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePermission(req, res, next) {
        try {
            const { permissionId } = req.params;
            await (0, rbacService_1.deletePermission)(permissionId);
            (0, apiResponse_1.sendResponse)(res, 'PERMISSION_DELETED');
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
            (0, apiResponse_1.sendResponse)(res, 'ROLE_ASSIGNED', { data: user });
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
            (0, apiResponse_1.sendResponse)(res, 'PERMISSION_CHECKED', { data: { hasPermission } });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RBACController = RBACController;
//# sourceMappingURL=rbacController.js.map