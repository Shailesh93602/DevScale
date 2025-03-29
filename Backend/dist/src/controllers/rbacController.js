"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rbacRepository_1 = require("../repositories/rbacRepository");
const validateRequest_1 = require("../middlewares/validateRequest");
const rbacValidations_1 = require("../validations/rbacValidations");
const apiResponse_1 = require("../utils/apiResponse");
const utils_1 = require("@/utils");
const userRepository_1 = __importDefault(require("@/repositories/userRepository"));
class RBACController {
    rbacRepository;
    userRepository;
    constructor() {
        this.rbacRepository = new rbacRepository_1.RBACRepository();
        this.userRepository = new userRepository_1.default();
    }
    createRole = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(rbacValidations_1.roleSchema, req.body);
        const role = await this.rbacRepository.createRole(req.body);
        (0, apiResponse_1.sendResponse)(res, 'ROLE_CREATED', { data: role });
    });
    updateRole = (0, utils_1.catchAsync)(async (req, res) => {
        const { roleId } = req.params;
        (0, validateRequest_1.validateRequest)(rbacValidations_1.roleSchema, req.body);
        const role = await this.rbacRepository.updateRole(roleId, req.body);
        (0, apiResponse_1.sendResponse)(res, 'ROLE_UPDATED', { data: role });
    });
    deleteRole = (0, utils_1.catchAsync)(async (req, res) => {
        const { roleId } = req.params;
        await this.rbacRepository.delete({ where: { id: roleId } });
        (0, apiResponse_1.sendResponse)(res, 'ROLE_DELETED');
    });
    getRoleHierarchy = (0, utils_1.catchAsync)(async (req, res) => {
        const { roleId } = req.params;
        const hierarchy = await this.rbacRepository.getRoleHierarchy(roleId);
        (0, apiResponse_1.sendResponse)(res, 'ROLE_HIERARCHY_FETCHED', { data: hierarchy });
    });
    createPermission = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(rbacValidations_1.permissionSchema, req.body);
        const permission = await this.rbacRepository.createPermission(req.body);
        (0, apiResponse_1.sendResponse)(res, 'PERMISSION_CREATED', { data: permission });
    });
    updatePermission = (0, utils_1.catchAsync)(async (req, res) => {
        const { permissionId } = req.params;
        (0, validateRequest_1.validateRequest)(rbacValidations_1.permissionSchema, req.body);
        const permission = await this.rbacRepository.updatePermission(permissionId, req.body);
        (0, apiResponse_1.sendResponse)(res, 'PERMISSION_UPDATED', { data: permission });
    });
    deletePermission = (0, utils_1.catchAsync)(async (req, res) => {
        const { permissionId } = req.params;
        await this.rbacRepository.deletePermission(permissionId);
        (0, apiResponse_1.sendResponse)(res, 'PERMISSION_DELETED');
    });
    assignRoleToUser = (0, utils_1.catchAsync)(async (req, res) => {
        (0, validateRequest_1.validateRequest)(rbacValidations_1.roleAssignmentSchema, req.body);
        const { userId, roleId } = req.body;
        const user = await this.userRepository.assignRole(userId, roleId);
        (0, apiResponse_1.sendResponse)(res, 'ROLE_ASSIGNED', { data: user });
    });
    checkPermission = (0, utils_1.catchAsync)(async (req, res) => {
        const { userId, resource, action } = req.query;
        if (!userId || !resource || !action) {
            throw new Error('Missing required parameters');
        }
        const hasPermission = await this.rbacRepository.checkPermission(userId, resource, action);
        (0, apiResponse_1.sendResponse)(res, 'PERMISSION_CHECKED', { data: { hasPermission } });
    });
}
exports.default = RBACController;
//# sourceMappingURL=rbacController.js.map