import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import prisma from '../lib/prisma.js';
import { canDo } from '../services/permissionService.js';
import type { Action, Resource } from '../constants/permissions.js';

/**
 * Permission-based guards.
 *
 * These existed before and were dead: both call sites were commented out,
 * because the permission catalogue was four bare verbs (`create`, `read`, …)
 * with no resource, so `requirePermission('tickets','update')` looked up
 * `tickets:update`, found nothing, and refused everyone including admins.
 * See constants/permissions.ts.
 *
 * They now resolve against role defaults plus per-user overrides, with DENY
 * taking precedence — see services/permissionService.ts for the model.
 *
 * WHEN TO USE WHICH GUARD.
 *
 *   authorizeRoles('ADMIN')                 — "only admins", a coarse gate on a
 *                                             whole admin router. Still correct
 *                                             and still used; nothing about it
 *                                             is deprecated.
 *   requirePermission(Resource.X, Action.Y) — "whoever may do this", when the
 *                                             answer should be able to differ
 *                                             per person: a trusted student
 *                                             given one extra power, or a
 *                                             moderator who has had one taken
 *                                             away.
 *
 * Both are named functions, not anonymous, so the route-contract test can see
 * them in the Express stack and so a rejection is attributable in a stack trace.
 */

export const requirePermission = (
  resource: Resource | string,
  action: Action | string
) => {
  return async function requirePermissionMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(createAppError('Unauthorized - Login required', 401));
      }
      const permitted = await canDo(req.user.id, resource, action);
      if (!permitted) {
        // 403 with the permission NAMED. A guard that refuses without saying
        // which permission was missing turns every access problem into a
        // support ticket and a log dive.
        return next(
          createAppError(`Forbidden - requires ${resource}:${action}`, 403)
        );
      }
      next();
    } catch (error) {
      // Fail CLOSED. A resolution failure (database down mid-request) must not
      // become an open door; the alternative is an authorisation check whose
      // outage is indistinguishable from a grant.
      logger.error('Permission check failed:', error);
      next(createAppError('Authorization check failed', 500));
    }
  };
};

export const requireRole = (role: string) => {
  return async function requireRoleMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return next(createAppError('Unauthorized - Login required', 401));
      }
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { role: true },
      });
      // Case-insensitive for the same reason authorizeRoles is: call sites in
      // this codebase pass both 'admin' and 'ADMIN', and a case-sensitive
      // compare silently 403s real admins.
      if (user?.role?.name?.toUpperCase() !== role.toUpperCase()) {
        return next(createAppError('Forbidden', 403));
      }
      next();
    } catch (error) {
      logger.error('Role check failed:', error);
      next(createAppError('Authorization check failed', 500));
    }
  };
};
