import { Request, Response, NextFunction } from 'express';
import {
  createRole,
  updateRole,
  deleteRole,
  getRoleHierarchy,
  createPermission,
  updatePermission,
  deletePermission,
  assignRoleToUser,
  checkPermission,
} from '../services/rbacService';
import { validateRequest } from '../middlewares/validateRequest';
import {
  roleSchema,
  permissionSchema,
  roleAssignmentSchema,
} from '../validations/rbacValidations';
import { sendResponse } from '../utils/apiResponse';

export class RBACController {
  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(roleSchema, req.body);
      const role = await createRole(req.body);
      sendResponse(res, 'ROLE_CREATED', { data: role });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      validateRequest(roleSchema, req.body);
      const role = await updateRole(roleId, req.body);
      sendResponse(res, 'ROLE_UPDATED', { data: role });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      await deleteRole(roleId);
      sendResponse(res, 'ROLE_DELETED');
    } catch (error) {
      next(error);
    }
  }

  static async getRoleHierarchy(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { roleId } = req.params;
      const hierarchy = await getRoleHierarchy(roleId);
      sendResponse(res, 'ROLE_HIERARCHY_FETCHED', { data: hierarchy });
    } catch (error) {
      next(error);
    }
  }

  static async createPermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      validateRequest(permissionSchema, req.body);
      const permission = await createPermission(req.body);
      sendResponse(res, 'PERMISSION_CREATED', { data: permission });
    } catch (error) {
      next(error);
    }
  }

  static async updatePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { permissionId } = req.params;
      validateRequest(permissionSchema, req.body);
      const permission = await updatePermission(permissionId, req.body);
      sendResponse(res, 'PERMISSION_UPDATED', { data: permission });
    } catch (error) {
      next(error);
    }
  }

  static async deletePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { permissionId } = req.params;
      await deletePermission(permissionId);
      sendResponse(res, 'PERMISSION_DELETED');
    } catch (error) {
      next(error);
    }
  }

  static async assignRoleToUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      validateRequest(roleAssignmentSchema, req.body);
      const { userId, roleId } = req.body;
      const user = await assignRoleToUser(userId, roleId);
      sendResponse(res, 'ROLE_ASSIGNED', { data: user });
    } catch (error) {
      next(error);
    }
  }

  static async checkPermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId, resource, action } = req.query;
      if (!userId || !resource || !action) {
        throw new Error('Missing required parameters');
      }
      const hasPermission = await checkPermission(
        userId as string,
        resource as string,
        action as string
      );
      sendResponse(res, 'PERMISSION_CHECKED', { data: { hasPermission } });
    } catch (error) {
      next(error);
    }
  }
}
