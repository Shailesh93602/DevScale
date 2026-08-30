import prisma from '../lib/prisma.js';
import {
  PermissionEffect,
  SUPERUSER,
  type Action,
  type Resource,
} from '../constants/permissions.js';

/**
 * Resolving what a person may actually do.
 *
 * THE MODEL, IN ONE PLACE.
 *
 *   role defaults  →  the baseline for everyone holding that role
 *   user overrides →  the exceptions, ALLOW or DENY, optionally time-boxed
 *
 * RESOLUTION ORDER, most specific first:
 *
 *   1. An unexpired user DENY            → refused, always
 *   2. An unexpired user ALLOW           → permitted
 *   3. The role grants it (or holds `*`) → permitted
 *   4. Otherwise                         → refused
 *
 * WHY DENY WINS.
 *
 * The alternative — additive-only, where any grant anywhere permits — cannot
 * express "this person specifically may not do this". The only way to revoke
 * would be to change the person's ROLE, which changes everything else about
 * them at the same time, or to edit the role, which changes it for everyone
 * who holds it. Both are how a small, reversible decision turns into a large,
 * irreversible one. So DENY is absolute here, exactly as it is in the major
 * cloud IAM systems.
 *
 * The cost is real and worth naming: a DENY on a user who later becomes an
 * admin still applies. That is why `*` is checked AFTER user denies — an admin
 * with an explicit deny is a deliberate state, not an accident. It is also why
 * every override records who granted it and why.
 *
 * WHY EXPIRY EXISTS.
 *
 * Overrides are exceptions, and exceptions outlive their reasons. Access that
 * nobody remembers granting is the single most common finding in access
 * reviews. An expiry turns "remember to take this away" into something the
 * system does. Expiry is evaluated at READ time rather than by a cleanup job,
 * so a lapsed override stops working the moment it lapses even if no job ran.
 */

export interface EffectivePermissions {
  readonly userId: string;
  readonly roleName: string | null;
  /** Keys granted by the role (or `*`). */
  readonly fromRole: ReadonlySet<string>;
  /** Keys explicitly allowed for this person. */
  readonly allowed: ReadonlySet<string>;
  /** Keys explicitly denied for this person. Beats everything above. */
  readonly denied: ReadonlySet<string>;
}

/**
 * A small in-process cache.
 *
 * A permission check runs on every guarded request, and resolving one is a
 * four-table read. Without a cache the guard becomes the slowest thing in the
 * request; with an unbounded or never-invalidated one, a revoked permission
 * keeps working — which is worse than slow.
 *
 * So: a short TTL, an explicit invalidation on every write path that can change
 * the answer, and a hard size cap. The TTL is the backstop for the case the
 * invalidation misses (another process, a direct DB edit); the invalidation is
 * what makes a revocation take effect immediately in the process that made it.
 *
 * Deliberately in-process rather than Redis: it must keep working when Redis is
 * down. An authorisation cache that fails open on a cache outage would be a
 * far worse bug than a few extra queries — and the rate limiter in this same
 * codebase already demonstrated how quietly that happens.
 */
const CACHE_TTL_MS = 30_000;
const CACHE_MAX_ENTRIES = 5_000;
const cache = new Map<
  string,
  { value: EffectivePermissions; expiresAt: number }
>();

function cacheGet(userId: string): EffectivePermissions | null {
  const hit = cache.get(userId);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(userId);
    return null;
  }
  return hit.value;
}

function cacheSet(userId: string, value: EffectivePermissions): void {
  // Bound the map. Oldest-inserted goes first — Map preserves insertion order,
  // and an approximate policy is fine for a cache whose entries all expire
  // within 30 seconds anyway.
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(userId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/** Drop a user's cached resolution. Call after ANY change to their access. */
export function invalidatePermissions(userId: string): void {
  cache.delete(userId);
}

/** Drop everything — after a role's permissions change, which affects many users. */
export function invalidateAllPermissions(): void {
  cache.clear();
}

/** Load and cache the full picture for one user. */
export async function getEffectivePermissions(
  userId: string
): Promise<EffectivePermissions> {
  const cached = cacheGet(userId);
  if (cached) return cached;

  const [user, overrides] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: {
          select: {
            name: true,
            permissions: { select: { permission: { select: { key: true } } } },
          },
        },
      },
    }),
    prisma.userPermission.findMany({
      where: {
        user_id: userId,
        // Expiry is applied in the QUERY as well as being a read-time concept,
        // so a lapsed override never even reaches the resolution logic.
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
      select: { effect: true, permission: { select: { key: true } } },
    }),
  ]);

  const allowed = new Set<string>();
  const denied = new Set<string>();
  for (const o of overrides) {
    (o.effect === PermissionEffect.DENY ? denied : allowed).add(
      o.permission.key
    );
  }

  const resolved: EffectivePermissions = {
    userId,
    roleName: user?.role?.name ?? null,
    fromRole: new Set(
      user?.role?.permissions.map((p) => p.permission.key) ?? []
    ),
    allowed,
    denied,
  };

  // A user who does not exist is resolved as "no permissions" and cached like
  // any other answer: a deleted account should not become a database query on
  // every subsequent request.
  cacheSet(userId, resolved);
  return resolved;
}

/** Decide one permission against an already-resolved set. Pure, so it is testable. */
export function decide(
  effective: EffectivePermissions,
  permissionKey: string
): boolean {
  // 1. An explicit deny is final — including against the `*` wildcard.
  if (effective.denied.has(permissionKey) || effective.denied.has(SUPERUSER)) {
    return false;
  }
  // 2. An explicit grant for this person.
  if (
    effective.allowed.has(permissionKey) ||
    effective.allowed.has(SUPERUSER)
  ) {
    return true;
  }
  // 3. The role's baseline, including the superuser wildcard.
  return (
    effective.fromRole.has(permissionKey) || effective.fromRole.has(SUPERUSER)
  );
}

/** Does this user hold this permission right now? */
export async function can(
  userId: string,
  permissionKey: string
): Promise<boolean> {
  return decide(await getEffectivePermissions(userId), permissionKey);
}

/** Convenience for the `resource`/`action` call shape used by the middleware. */
export async function canDo(
  userId: string,
  resource: Resource | string,
  action: Action | string
): Promise<boolean> {
  return can(userId, `${resource}:${action}`);
}

/**
 * Every permission this user effectively holds, for the UI to render against.
 *
 * Returned as a sorted array of concrete keys. `*` is expanded by the caller
 * that knows the catalogue, so this stays a pure set operation.
 */
export function effectiveKeys(
  effective: EffectivePermissions,
  catalogue: readonly string[]
): string[] {
  return catalogue
    .filter((key) => key !== SUPERUSER && decide(effective, key))
    .sort();
}
