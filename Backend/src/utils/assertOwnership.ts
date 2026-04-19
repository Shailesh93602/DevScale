import { Request, Response } from 'express';
import { sendResponse } from './apiResponse';

/**
 * Asserts that the authenticated user owns the resource.
 *
 * Returns `true` and sends a 403 JSON response if the check fails, so the
 * caller can `return assertOwnership(...)` immediately to short-circuit.
 * Returns `false` when ownership is confirmed (caller should continue).
 *
 * Admins (role === 'ADMIN') bypass the ownership check.
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
  const role = (req.user as { role?: string } | undefined)?.role;

  if (role === 'ADMIN') return false; // admins may act on any resource

  if (!userId || userId !== resourceOwnerId) {
    sendResponse(res, 'FORBIDDEN', {
      error: 'You do not have permission to modify this resource.',
    });
    return true; // denied — caller must return
  }

  return false; // approved
}
