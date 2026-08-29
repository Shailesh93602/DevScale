import { Request, Response } from 'express';
import { RBACRepository } from '../repositories/rbacRepository';
import { validateRequest } from '../middlewares/validateRequest';
import {
  roleSchema,
  permissionSchema,
  roleAssignmentSchema,
} from '../validations/rbacValidations';
import { sendResponse } from '../utils/apiResponse';
import { catchAsync } from '../utils';
import UserRepository from '../repositories/userRepository';
import { createAppError } from '../utils/errorHandler.js';

export default class RBACController {
  private readonly rbacRepository: RBACRepository;
  private readonly userRepository: UserRepository;

  constructor() {
    this.rbacRepository = new RBACRepository();
    this.userRepository = new UserRepository();
  }

  public createRole = catchAsync(async (req: Request, res: Response) => {
    validateRequest(roleSchema, req.body);
    const role = await this.rbacRepository.createRole(req.body);
    sendResponse(res, 'ROLE_CREATED', { data: role });
  });

  public updateRole = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    validateRequest(roleSchema, req.body);
    const role = await this.rbacRepository.updateRole(roleId, req.body);
    sendResponse(res, 'ROLE_UPDATED', { data: role });
  });

  public deleteRole = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    await this.rbacRepository.delete({ where: { id: roleId } });
    sendResponse(res, 'ROLE_DELETED');
  });

  public getRoleHierarchy = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    const hierarchy = await this.rbacRepository.getRoleHierarchy(roleId);
    sendResponse(res, 'ROLE_HIERARCHY_FETCHED', { data: hierarchy });
  });

  public createPermission = catchAsync(async (req: Request, res: Response) => {
    validateRequest(permissionSchema, req.body);
    const permission = await this.rbacRepository.createPermission(req.body);
    sendResponse(res, 'PERMISSION_CREATED', { data: permission });
  });

  public updatePermission = catchAsync(async (req: Request, res: Response) => {
    const { permissionId } = req.params;
    validateRequest(permissionSchema, req.body);
    const permission = await this.rbacRepository.updatePermission(
      permissionId,
      req.body
    );
    sendResponse(res, 'PERMISSION_UPDATED', { data: permission });
  });

  public deletePermission = catchAsync(async (req: Request, res: Response) => {
    const { permissionId } = req.params;
    await this.rbacRepository.deletePermission(permissionId);
    sendResponse(res, 'PERMISSION_DELETED');
  });

  public assignRoleToUser = catchAsync(async (req: Request, res: Response) => {
    validateRequest(roleAssignmentSchema, req.body);
    const { userId, roleId } = req.body;
    const user = await this.userRepository.assignRole(userId, roleId);
    sendResponse(res, 'ROLE_ASSIGNED', { data: user });
  });

  /**
   * GET /rbac/check-permission?userId&resource&action
   *
   * Deliberately available to any authenticated user — unlike every other
   * route on this router, which is ADMIN-only — because the UI uses it to
   * decide what to render for the CURRENT user.
   *
   * 🔴 It did not enforce "current". `userId` comes from the query string, so
   * any signed-in user could ask about anyone else's permissions and map the
   * authorisation model account by account. The route's own comment said
   * "their own permissions"; the handler never checked.
   *
   * Admins keep the ability to ask about other users — that is a legitimate
   * part of administering roles, and the rest of this router is already gated
   * to them.
   */
  public checkPermission = catchAsync(async (req: Request, res: Response) => {
    const { userId, resource, action } = req.query;
    if (!userId || !resource || !action) {
      // 400, not a bare Error. A thrown Error becomes a 500 whose message is
      // replaced with "Internal server error" in production, so the caller
      // learns nothing about a mistake that is entirely theirs to fix.
      throw createAppError(
        'userId, resource and action are all required.',
        400
      );
    }

    const callerId = req.user?.id;
    const callerIsAdmin = req.user?.role?.name?.toUpperCase() === 'ADMIN';
    if (!callerIsAdmin && userId !== callerId) {
      throw createAppError('You can only check your own permissions.', 403);
    }

    const hasPermission = await this.rbacRepository.checkPermission(
      userId as string,
      resource as string,
      action as string
    );
    sendResponse(res, 'PERMISSION_CHECKED', { data: hasPermission });
  });
}
