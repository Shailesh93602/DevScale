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
import { recordActionBestEffort } from '../services/auditTrail';
import prisma from '../lib/prisma.js';
import {
  invalidatePermissions,
  getEffectivePermissions,
  effectiveKeys,
} from '../services/permissionService.js';
import {
  PERMISSION_CATALOGUE,
  PermissionEffect,
} from '../constants/permissions.js';
import logger from '../utils/logger';

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
    await this.record(req, 'CREATE_ROLE', 'ROLE', role.id, {
      name: req.body.name,
    });
    sendResponse(res, 'ROLE_CREATED', { data: role });
  });

  public updateRole = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    validateRequest(roleSchema, req.body);
    const role = await this.rbacRepository.updateRole(roleId, req.body);
    await this.record(req, 'UPDATE_ROLE', 'ROLE', roleId, {
      name: req.body.name,
    });
    sendResponse(res, 'ROLE_UPDATED', { data: role });
  });

  public deleteRole = catchAsync(async (req: Request, res: Response) => {
    const { roleId } = req.params;
    await this.rbacRepository.delete({ where: { id: roleId } });
    await this.record(req, 'DELETE_ROLE', 'ROLE', roleId);
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
    await this.record(req, 'CREATE_PERMISSION', 'PERMISSION', permission.id, {
      resource: req.body.resource,
      action: req.body.action,
    });
    sendResponse(res, 'PERMISSION_CREATED', { data: permission });
  });

  public updatePermission = catchAsync(async (req: Request, res: Response) => {
    const { permissionId } = req.params;
    validateRequest(permissionSchema, req.body);
    const permission = await this.rbacRepository.updatePermission(
      permissionId,
      req.body
    );
    await this.record(req, 'UPDATE_PERMISSION', 'PERMISSION', permissionId, {
      resource: req.body.resource,
      action: req.body.action,
    });
    sendResponse(res, 'PERMISSION_UPDATED', { data: permission });
  });

  public deletePermission = catchAsync(async (req: Request, res: Response) => {
    const { permissionId } = req.params;
    await this.rbacRepository.deletePermission(permissionId);
    await this.record(req, 'DELETE_PERMISSION', 'PERMISSION', permissionId);
    sendResponse(res, 'PERMISSION_DELETED');
  });

  public assignRoleToUser = catchAsync(async (req: Request, res: Response) => {
    validateRequest(roleAssignmentSchema, req.body);
    const { userId, roleId } = req.body;
    const user = await this.userRepository.assignRole(userId, roleId);

    // BEST-EFFORT, for the same reason as adminController's UPDATE_USER_ROLE:
    // assignRole also writes the Supabase app_metadata claim, an external call
    // that cannot join a database transaction. The grant has already happened
    // and cannot be rolled back, so an audit failure is logged loudly rather
    // than turned into a 500 that invites a retry of a completed privilege
    // change.
    await this.record(req, 'ASSIGN_ROLE_TO_USER', 'USER', userId, { roleId });

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

  /**
   * Record a completed RBAC change.
   *
   * BEST-EFFORT, DELIBERATELY — and worth saying why, since the equivalent
   * KhataGO work makes the opposite choice. These writes go through
   * RBACRepository, which owns its own client; threading a transaction through
   * it to make the record atomic is the right shape but a wider change than
   * this gap justifies, and a half-done version would be worse than an honest
   * best-effort. What matters is that the NAME says which guarantee you get,
   * so nobody reads an empty trail as proof that nothing happened.
   *
   * These are the highest-value rows in the table whatever the guarantee:
   * every other audited action is something an admin did. These record how
   * someone became able to do it.
   */
  /**
   * Grant or revoke ONE permission for ONE person, on top of their role.
   *
   * This is the operator-facing half of the override model: roles carry the
   * defaults, and this carries the exceptions — a capable student given a
   * single extra power, or one capability taken away from a moderator without
   * demoting them and without changing what the role means for everyone else.
   *
   * `expiresAt` is strongly encouraged and deliberately surfaced in the API
   * rather than buried: an exception that outlives its reason is how temporary
   * access silently becomes permanent, and the usual finding in an access
   * review is standing access nobody remembers granting.
   */
  public setUserPermission = catchAsync(async (req: Request, res: Response) => {
    const { userId, permissionKey, effect, expiresAt, reason } = req.body as {
      userId?: string;
      permissionKey?: string;
      effect?: string;
      expiresAt?: string;
      reason?: string;
    };

    if (!userId || !permissionKey) {
      throw createAppError('userId and permissionKey are both required.', 400);
    }
    const resolvedEffect = (effect ?? PermissionEffect.ALLOW).toUpperCase();
    if (
      resolvedEffect !== PermissionEffect.ALLOW &&
      resolvedEffect !== PermissionEffect.DENY
    ) {
      throw createAppError("effect must be 'ALLOW' or 'DENY'.", 400);
    }

    const permission = await prisma.permission.findUnique({
      where: { key: permissionKey },
    });
    if (!permission) {
      // Naming the valid keys turns a guessing game into a fixable mistake.
      throw createAppError(
        `Unknown permission '${permissionKey}'. Known keys: ${PERMISSION_CATALOGUE.map((p) => p.key).join(', ')}`,
        400
      );
    }

    let expires: Date | null = null;
    if (expiresAt) {
      expires = new Date(expiresAt);
      if (Number.isNaN(expires.getTime())) {
        throw createAppError('expiresAt must be a valid ISO date.', 400);
      }
      if (expires.getTime() <= Date.now()) {
        // An already-expired override is inert. Accepting it silently would
        // look like a successful grant that never worked.
        throw createAppError('expiresAt must be in the future.', 400);
      }
    }

    const override = await prisma.userPermission.upsert({
      where: {
        user_id_permission_id: {
          user_id: userId,
          permission_id: permission.id,
        },
      },
      create: {
        user_id: userId,
        permission_id: permission.id,
        effect: resolvedEffect,
        expires_at: expires,
        granted_by: req.user.id,
        reason: reason ?? null,
      },
      update: {
        effect: resolvedEffect,
        expires_at: expires,
        granted_by: req.user.id,
        reason: reason ?? null,
      },
    });

    // The cached resolution is now wrong for this user. Invalidate BEFORE
    // responding, so a client that immediately re-reads sees the new answer.
    invalidatePermissions(userId);

    await this.record(req, 'SET_USER_PERMISSION', 'USER', userId, {
      permissionKey,
      effect: resolvedEffect,
      expiresAt: expires?.toISOString() ?? null,
      reason: reason ?? null,
    });

    return sendResponse(res, 'PERMISSION_UPDATED', { data: override });
  });

  /** Remove an override, returning the person to whatever their role says. */
  public removeUserPermission = catchAsync(
    async (req: Request, res: Response) => {
      const { userId, permissionKey } = req.body as {
        userId?: string;
        permissionKey?: string;
      };
      if (!userId || !permissionKey) {
        throw createAppError(
          'userId and permissionKey are both required.',
          400
        );
      }
      const permission = await prisma.permission.findUnique({
        where: { key: permissionKey },
      });
      if (!permission) {
        throw createAppError(`Unknown permission '${permissionKey}'.`, 400);
      }

      const { count } = await prisma.userPermission.deleteMany({
        where: { user_id: userId, permission_id: permission.id },
      });
      invalidatePermissions(userId);

      // Only record something that happened. A row for a no-op delete is a
      // false entry in a table whose whole value is being trustworthy.
      if (count > 0) {
        await this.record(req, 'REMOVE_USER_PERMISSION', 'USER', userId, {
          permissionKey,
        });
      }

      return sendResponse(res, 'PERMISSION_UPDATED', {
        data: { removed: count },
      });
    }
  );

  /**
   * What can this person actually do, and why?
   *
   * Returns the resolved answer AND its provenance, because "why can they do
   * that?" is the question an access review actually asks, and a flat list of
   * effective permissions cannot answer it.
   */
  public getUserPermissions = catchAsync(
    async (req: Request, res: Response) => {
      const userId =
        req.params.userId ?? (req.query.userId as string | undefined);
      if (!userId) throw createAppError('userId is required.', 400);

      const effective = await getEffectivePermissions(userId);
      const overrides = await prisma.userPermission.findMany({
        where: { user_id: userId },
        select: {
          effect: true,
          expires_at: true,
          granted_by: true,
          reason: true,
          permission: { select: { key: true } },
        },
      });

      return sendResponse(res, 'PERMISSION_CHECKED', {
        data: {
          userId,
          role: effective.roleName,
          effective: effectiveKeys(
            effective,
            PERMISSION_CATALOGUE.map((p) => p.key)
          ),
          fromRole: [...effective.fromRole].sort(),
          overrides: overrides.map((o) => ({
            key: o.permission.key,
            effect: o.effect,
            expiresAt: o.expires_at,
            grantedBy: o.granted_by,
            reason: o.reason,
            // Surfaced explicitly: an expired row still EXISTS, and an operator
            // looking at the list needs to know why it is not taking effect.
            active: !o.expires_at || o.expires_at.getTime() > Date.now(),
          })),
        },
      });
    }
  );

  private record(
    req: Request,
    action: string,
    entity: string,
    entity_id: string,
    details?: Record<string, unknown>
  ) {
    return recordActionBestEffort(
      {
        admin_id: req.user.id,
        action,
        entity,
        entity_id,
        details,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
      logger
    );
  }
}
