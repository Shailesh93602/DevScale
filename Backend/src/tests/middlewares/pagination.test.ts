import { describe, it, expect, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import paginationMiddleware from '../../middlewares/paginationMiddleware';

/**
 * Pagination defaults are real defaults, and the ceiling exists.
 *
 * 🔴 THE BUG THIS LOCKS OUT reads as if it already handled these cases:
 *
 *     let limit = parseInt(String(req.query.limit)) ?? 10;
 *     if (limit < 1) limit = 10;
 *
 * `parseInt` returns NaN, and NaN is neither null nor undefined, so `??` does
 * not substitute. The guard beneath it does not rescue it either, because every
 * comparison with NaN is false. On any request that did not pass the params —
 * the ordinary case — page, limit and offset were ALL NaN, and Prisma received
 * `take: NaN, skip: NaN`.
 *
 * Two lines that each look like a default, and together provide none. That is
 * the kind of defect a test finds and a reading does not, which is the argument
 * for this file existing at all.
 *
 * The `search` case is the same shape with a visible consequence: `String(
 * undefined)` is the truthy string "undefined", assigned unconditionally, and
 * the one consumer branches on `search ? ... : undefined` — so the default
 * resource listing searched titles and descriptions for the literal word
 * "undefined" and returned nothing.
 */
const run = (query: Record<string, unknown>) => {
  const req = { query } as unknown as Request;
  const next = jest.fn() as unknown as NextFunction;
  paginationMiddleware(req, {} as Response, next);
  return req.pagination!;
};

describe('paginationMiddleware', () => {
  it('applies real defaults when nothing is passed', () => {
    const p = run({});
    expect(p.page).toBe(1);
    expect(p.limit).toBe(10);
    expect(p.offset).toBe(0);
    // The assertion that would have caught the original: NaN is not 1.
    expect(Number.isNaN(p.limit)).toBe(false);
    expect(Number.isNaN(p.offset)).toBe(false);
  });

  it('leaves search UNDEFINED when none was given', () => {
    // Not the string "undefined", which is truthy and was silently used as a
    // search term.
    expect(run({}).search).toBeUndefined();
    expect(run({ search: '' }).search).toBeUndefined();
    expect(run({ search: '   ' }).search).toBeUndefined();
  });

  it('keeps a real search term', () => {
    expect(run({ search: 'algebra' }).search).toBe('algebra');
  });

  it('CAPS the page size', () => {
    // Without this, one request asks the database for every row in the table.
    expect(run({ limit: '99999999' }).limit).toBe(100);
    expect(run({ limit: '50' }).limit).toBe(50);
  });

  it('falls back rather than trusting junk', () => {
    expect(run({ limit: 'abc', page: 'xyz' })).toMatchObject({
      limit: 10,
      page: 1,
    });
    expect(run({ limit: '-5', page: '0' })).toMatchObject({
      limit: 10,
      page: 1,
    });
  });

  it('computes an offset from the capped limit, not the requested one', () => {
    // Using the raw limit here would reintroduce the unbounded read through
    // skip instead of take.
    expect(run({ page: '3', limit: '99999999' }).offset).toBe(200);
  });

  it('defaults orderBy without inventing the word undefined', () => {
    expect(run({}).orderBy).toBe('createdAt');
    expect(run({ orderBy: 'title' }).orderBy).toBe('title');
  });

  it('only accepts desc, case-insensitively', () => {
    expect(run({ order: 'DeSc' }).order).toBe('DESC');
    expect(run({}).order).toBe('ASC');
  });
});
