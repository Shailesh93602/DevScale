import { describe, it, expect } from '@jest/globals';
import { customReportSchema } from '../../validations/adminValidations';

/**
 * POST /admin/reports/custom validates its body.
 *
 * It previously did not — `adminRoutes` used `validateRequest` on nothing at
 * all, so `req.body` reached the repository untouched. The bound existed only
 * in `ReportConfig`'s TypeScript type, which reads like a constraint and
 * enforces nothing at runtime.
 *
 * The interesting case is duplicates. Each metric fans out to its own
 * `groupBy` through `Promise.all`, so `["userGrowth"] * 1000` issued a
 * thousand PARALLEL aggregate queries — connection-pool exhaustion, which
 * takes down the rest of the API rather than just this request.
 *
 * `.unique()` is the assertion that actually closes that, and the cap is FOUR
 * because four distinct metrics exist. The bound comes from the domain rather
 * than from a number someone picked, so it cannot drift from reality the way
 * `.max(50)` would.
 */
const ok = (body: unknown) => customReportSchema.validate(body).error;

describe('custom report validation', () => {
  it('accepts a normal request', () => {
    expect(ok({ metrics: ['userGrowth'], format: 'csv' })).toBeUndefined();
  });

  it('REJECTS a repeated metric — the query fan-out', () => {
    const err = ok({ metrics: ['userGrowth', 'userGrowth'] });
    expect(err).toBeDefined();
    expect(err!.message).toMatch(/duplicate/i);
  });

  it('rejects more metrics than exist', () => {
    expect(
      ok({
        metrics: [
          'userGrowth',
          'contentEngagement',
          'challengeCompletion',
          'resourceUsage',
          'userGrowth',
        ],
      })
    ).toBeDefined();
  });

  it('rejects an unknown metric instead of reaching the repository default', () => {
    // The repository throws a 400 for an unknown metric, but only AFTER the
    // other metrics in the same request have already run their queries.
    expect(ok({ metrics: ['dropTables'] })).toBeDefined();
  });

  it('rejects a missing metrics array — a 400, not a 500 from .map', () => {
    // Omitting it threw inside `metrics.map`, and production replaces a 500's
    // message with "Internal server error", so the caller learned nothing
    // about a mistake that was entirely theirs.
    expect(ok({ format: 'json' })).toBeDefined();
    expect(ok({ metrics: [] })).toBeDefined();
  });

  it('rejects a time range that ends before it starts', () => {
    expect(
      ok({
        metrics: ['userGrowth'],
        timeRange: { start: '2026-02-01', end: '2026-01-01' },
      })
    ).toBeDefined();
  });

  it('rejects an unsupported output format', () => {
    expect(ok({ metrics: ['userGrowth'], format: 'pdf' })).toBeDefined();
  });
});
