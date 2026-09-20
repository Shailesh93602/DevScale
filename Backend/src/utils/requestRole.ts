import type { Request } from 'express';

/**
 * The ONE place the authenticated caller's role name is read.
 *
 * WHY THIS EXISTS.
 *
 * `authMiddleware` builds `req.user` with `include: { role: true }`, so
 * `req.user.role` is the Prisma `Role` RELATION OBJECT — `{ id, name: 'ADMIN',
 * … }` — and never a string. Two places consumed it and they disagreed:
 *
 *   - `authorizeRoles` read `req.user.role?.name` (correct), and
 *   - `assertOwnership` read `req.user.role` and compared it to `'ADMIN'`.
 *
 * An object is never `===` a string, so the second one's admin bypass could not
 * fire. It was not a hole — it failed closed — but it silently removed the
 * capability it existed to grant: an ADMIN got 403 on every resource they did
 * not personally create, including on routes that are admin-gated precisely so
 * an admin can moderate someone else's content.
 *
 * The type system could not object, and that is the more interesting half.
 * `src/types/express/index.d.ts` declared `role?: UserRole | null` importing
 * `UserRole` from `@prisma/client` — a type that does not exist (the model is
 * `Role`). With `skipLibCheck: true` a declaration file's own errors are not
 * reported, so the unresolved import was swallowed and `req.user.role` degraded
 * to `any` for the whole codebase. `req.user.role.doesNotExist` compiled
 * cleanly. That import is corrected alongside this helper, which restores the
 * compiler's ability to catch the next one.
 *
 * Comparison is case-insensitive because route declarations are inconsistent
 * about casing (`authorizeRoles('admin')` on roadmap delete vs `'ADMIN'`
 * everywhere else) and `authorizeRoles` already normalises. One reader, one
 * rule.
 */
export function getRoleName(req: Request): string | undefined {
  return req.user?.role?.name?.toUpperCase();
}

/** True when the caller holds one of `roles` (compared case-insensitively). */
export function hasRole(req: Request, ...roles: string[]): boolean {
  const name = getRoleName(req);
  if (!name) return false;
  return roles.some((r) => r.toUpperCase() === name);
}
