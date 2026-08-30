import { NextFunction, Request, Response } from 'express';

/**
 * The largest page anyone may ask for.
 *
 * Without a ceiling, `?limit=99999999` is honoured, and a single unauthenticated
 * request can ask the database for every row in a table and the process to hold
 * the result in memory. Every OTHER paginating route in this codebase already
 * caps (ratingController uses `Math.min(..., 100)`); the shared middleware — the
 * one place a cap would apply everywhere — was the one without it.
 */
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

/**
 * `parseInt` returns NaN, and NaN is not null or undefined.
 *
 * 🔴 That is the whole bug this replaces. The old code read:
 *
 *     let limit = parseInt(String(req.query.limit)) ?? 10;
 *
 * `??` only substitutes for null and undefined, so with no `limit` in the
 * query — the ordinary case — this produced NaN. The guard below it
 * (`if (limit < 1) limit = 10`) does not rescue it either, because every
 * comparison with NaN is false. `page`, `limit` and `offset` were therefore all
 * NaN on any request that did not pass them explicitly, and Prisma received
 * `take: NaN, skip: NaN`.
 *
 * It reads as if it has a default. It does not.
 */
function toPositiveInt(raw: unknown, fallback: number, max?: number): number {
  const parsed = Number.parseInt(String(raw), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max === undefined ? parsed : Math.min(parsed, max);
}

const paginationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const page = toPositiveInt(req.query.page, 1);
  const limit = toPositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const offset = (page - 1) * limit;

  /**
   * 🔴 `String(undefined)` is the STRING "undefined", and it is truthy.
   *
   * `search` was assigned unconditionally, so a request with no search term
   * arrived downstream as the literal word "undefined". The only
   * consumer branches on `search ? {...} : undefined`, so the default resource
   * listing searched titles and descriptions for the literal text "undefined"
   * and returned nothing.
   *
   * The `x !== 'undefined'` guards scattered through the controllers are
   * symptoms of this, not defensive style — they exist wherever someone hit the
   * bug and patched it locally instead of here.
   */
  const rawSearch = req.query.search;
  const search =
    typeof rawSearch === 'string' && rawSearch.trim() !== ''
      ? rawSearch
      : undefined;

  const order =
    String(req.query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const rawOrderBy = req.query.orderBy;
  const orderBy =
    typeof rawOrderBy === 'string' && rawOrderBy ? rawOrderBy : 'createdAt';

  req.pagination = { limit, offset, page, search, order, orderBy };

  next();
};

export default paginationMiddleware;
