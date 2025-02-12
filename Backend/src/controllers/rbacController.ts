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
} from '../validators/rbacValidators';

export class RBACController {
  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(roleSchema, req.body);
      const role = await createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      validateRequest(roleSchema, req.body);
      const role = await updateRole(roleId, req.body);
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { roleId } = req.params;
      await deleteRole(roleId);
      res.json({ success: true, message: 'Role deleted successfully' });
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
      res.json({ success: true, data: hierarchy });
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
      res.status(201).json({ success: true, data: permission });
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
      res.json({ success: true, data: permission });
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
      res.json({ success: true, message: 'Permission deleted successfully' });
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
      res.json({ success: true, data: user });
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
      res.json({ success: true, data: { hasPermission } });
    } catch (error) {
      next(error);
    }
  }
}
