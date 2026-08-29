import Joi from 'joi';

export const userSearchSchema = Joi.object({
  query: Joi.string().optional().default(''),
  role: Joi.string().optional().default(''),
});

export const configUpdateSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.any().required(),
});

export const resourceAllocationSchema = Joi.object({
  resourceType: Joi.string().valid('storage', 'compute', 'network').required(),
  resourceId: Joi.string().required(),
  allocation: Joi.number().positive().required(),
});

export const reportConfigSchema = Joi.object({
  type: Joi.string().valid('user', 'platform').required(),
  id: Joi.string().optional(),
  dateRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().min(Joi.ref('start')).required(),
  }).optional(),
});

/**
 * POST /admin/reports/custom
 *
 * 🔴 THE BOUND ALREADY EXISTED — IN THE TYPE SYSTEM, WHERE IT CANNOT HELP.
 *
 * `ReportConfig.metrics` is typed as an array of four string literals, which
 * reads like a constraint and enforces nothing at runtime: this route had no
 * `validateRequest` at all, so `req.body` reached the repository untouched.
 *
 * Three consequences, in increasing order of how long they would take to
 * diagnose:
 *
 *   1. Omitting `metrics` threw inside `metrics.map` — a 500 whose message
 *      production replaces with "Internal server error", for a mistake that is
 *      entirely the caller's and trivially reportable as a 400.
 *   2. `metrics` was unbounded and allowed duplicates, and each element fans
 *      out to its own `groupBy` through `Promise.all`. Repeating one metric a
 *      thousand times issued a thousand PARALLEL aggregate queries — a
 *      connection-pool exhaustion that takes the rest of the API down with it.
 *   3. `filters` was spread straight into a Prisma `where`.
 *
 * `.unique()` plus the `valid()` list is what actually fixes (2), and it is
 * worth noticing why: the cap is FOUR because four distinct metrics exist. The
 * bound comes from the domain rather than from a number someone picked, so it
 * cannot drift away from reality the way `.max(50)` would.
 *
 * ADMIN-ONLY IS NOT A REASON TO SKIP THIS. It narrows who can trigger it, and
 * an admin fat-fingering a report request should not be able to stall the
 * database for everyone else.
 */
export const customReportSchema = Joi.object({
  metrics: Joi.array()
    .items(
      Joi.string().valid(
        'userGrowth',
        'contentEngagement',
        'challengeCompletion',
        'resourceUsage'
      )
    )
    .unique()
    .min(1)
    .max(4)
    .required(),
  // Left as a permissive object rather than tightened here: narrowing which
  // columns are filterable is a real improvement but a separate change with
  // its own blast radius, and pretending otherwise by adding a token
  // constraint would be worse than saying so.
  filters: Joi.object().optional(),
  groupBy: Joi.array().items(Joi.string()).max(10).optional(),
  timeRange: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().min(Joi.ref('start')).required(),
  }).optional(),
  format: Joi.string().valid('json', 'csv').optional(),
});

/**
 * The two schemas above this comment — `configUpdateSchema` and
 * `resourceAllocationSchema` — were written and wired to nothing.
 *
 * That is the third instance of the same shape found in this codebase today
 * (an audit helper, a retention job, and now these): the artefact exists, so
 * a reader assumes the feature does, and no test can tell the difference
 * because a test of an unused module passes.
 *
 * They are wired now, along with the two routes that had no schema at all.
 */
export const userRoleUpdateSchema = Joi.object({
  // The route is ADMIN-only and this is the field that grants privilege, so a
  // missing or non-string roleId should be a 400 naming the field rather than
  // a Prisma error surfacing as a 500.
  roleId: Joi.string().required(),
});

export const moderationSchema = Joi.object({
  // The repository types this as 'approve' | 'reject' and then upper-cases it
  // into a status. Anything else silently wrote a status nothing recognises.
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().max(1000).allow('').optional(),
});
