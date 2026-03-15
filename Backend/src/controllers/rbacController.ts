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

  public checkPermission = catchAsync(async (req: Request, res: Response) => {
    const { userId, resource, action } = req.query;
    if (!userId || !resource || !action) {
      throw new Error('Missing required parameters');
    }
    const hasPermission = await this.rbacRepository.checkPermission(
      userId as string,
      resource as string,
      action as string
    );
    sendResponse(res, 'PERMISSION_CHECKED', { data: hasPermission });
  });
}
