import { Request, Response } from 'express';
import { sendResponse } from './apiResponse';
import { hasRole } from './requestRole';

/**
 * Asserts that the authenticated user owns the resource.
 *
 * Returns `true` and sends a 403 JSON response if the check fails, so the
 * caller can `return assertOwnership(...)` immediately to short-circuit.
 * Returns `false` when ownership is confirmed (caller should continue).
 *
 * Admins bypass the ownership check.
 *
 * 🔴 The role is read through `hasRole`, NOT by comparing `req.user.role`
 * directly. `authMiddleware` populates `req.user` with `include: { role: true }`,
 * so `role` is the Prisma relation OBJECT (`{ id, name: 'ADMIN', … }`). This
 * function used to do `(req.user as { role?: string })?.role === 'ADMIN'`,
 * which is an object compared to a string: always false, so the bypass never
 * fired and every ADMIN was 403'd on any resource they had not personally
 * created. The hand-written cast is what hid it — it asserted the shape the
 * author expected instead of the shape the request carries. See
 * `utils/requestRole.ts` for why the compiler could not object either.
 *
 * Usage:
 *   const denied = assertOwnership(req, res, resource.user_id);
 *   if (denied) return;
 */
export function assertOwnership(
  req: Request,
  res: Response,
  resourceOwnerId: string | null | undefined
): boolean {
  const userId = req.user?.id;

  if (hasRole(req, 'ADMIN')) return false; // admins may act on any resource

  if (!userId || userId !== resourceOwnerId) {
    sendResponse(res, 'FORBIDDEN', {
      error: 'You do not have permission to modify this resource.',
    });
    return true; // denied — caller must return
  }

  return false; // approved
}
