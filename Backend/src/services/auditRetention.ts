/**
 * Audit-log retention.
 *
 * WHY THIS EXISTS.
 *
 * An audit table only ever grows. Nothing deleted from `AdminAuditLog`,
 * `SecurityAuditLog` or `ChangeHistory` — so every index on them grows too, and
 * the queries the admin panel runs against them get slower forever. The cost is
 * invisible for months and then permanent.
 *
 * TWO DIFFERENT RETENTIONS, ON PURPOSE.
 *
 * Security events are kept far longer than routine admin actions. "Who changed
 * this config in March" stops mattering quickly; "when did the failed-login
 * burst start" is the question asked during an incident, which is exactly when
 * the record is months old. Applying one number to both would either discard
 * the evidence or keep the noise.
 *
 * DELETED IN BATCHES, NOT ONE STATEMENT.
 *
 * A single unbounded `DELETE` on a large table takes a long-held lock and
 * writes one enormous WAL record. On a small instance that is a stall for
 * everything else touching the table — including the admin panel that reads it.
 * Batching bounds the lock and lets the job be interrupted safely: it is
 * idempotent, so the next run simply continues.
 */

import prisma from '../lib/prisma.js';
import logger from '../utils/logger.js';

/**
 * Routine admin actions. Ninety days covers "what changed recently and who did
 * it", which is what this trail is actually consulted for.
 */
export const ADMIN_LOG_RETENTION_DAYS = Number(
  process.env.AUDIT_RETENTION_DAYS ?? 90
);

/**
 * Security events — a year, because they are read during incidents, and an
 * incident is usually discovered long after it began.
 */
export const SECURITY_LOG_RETENTION_DAYS = Number(
  process.env.SECURITY_AUDIT_RETENTION_DAYS ?? 365
);

/** Rows per statement. Small enough that the lock is never held long. */
const BATCH_SIZE = 1_000;

/** Stops a single run from monopolising the database if the backlog is huge. */
const MAX_BATCHES_PER_RUN = 50;

export interface PruneResult {
  adminLogsDeleted: number;
  securityLogsDeleted: number;
  /** True when the cap was hit — the next run continues from here. */
  moreRemaining: boolean;
}

function cutoff(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/**
 * Delete in batches until nothing older than the cutoff remains, or the cap is
 * reached.
 *
 * Prisma's `deleteMany` has no LIMIT, so the ids are selected first and deleted
 * by primary key. That is also what keeps each statement's lock footprint
 * predictable rather than dependent on how much history happens to have
 * accumulated.
 */
async function pruneTable(
  table: 'adminAuditLog' | 'securityAuditLog',
  before: Date
): Promise<{ deleted: number; moreRemaining: boolean }> {
  let deleted = 0;

  for (let batch = 0; batch < MAX_BATCHES_PER_RUN; batch++) {
    const rows =
      table === 'adminAuditLog'
        ? await prisma.adminAuditLog.findMany({
            where: { created_at: { lt: before } },
            select: { id: true },
            take: BATCH_SIZE,
          })
        : await prisma.securityAuditLog.findMany({
            where: { created_at: { lt: before } },
            select: { id: true },
            take: BATCH_SIZE,
          });

    if (rows.length === 0) return { deleted, moreRemaining: false };

    const ids = rows.map((r) => r.id);
    const result =
      table === 'adminAuditLog'
        ? await prisma.adminAuditLog.deleteMany({ where: { id: { in: ids } } })
        : await prisma.securityAuditLog.deleteMany({
            where: { id: { in: ids } },
          });

    deleted += result.count;
  }

  return { deleted, moreRemaining: true };
}

/**
 * Prune both trails. Idempotent and safe to run at any time — running it twice
 * deletes nothing extra, and an interrupted run leaves the table consistent.
 */
export async function pruneAuditLogs(): Promise<PruneResult> {
  const admin = await pruneTable(
    'adminAuditLog',
    cutoff(ADMIN_LOG_RETENTION_DAYS)
  );
  const security = await pruneTable(
    'securityAuditLog',
    cutoff(SECURITY_LOG_RETENTION_DAYS)
  );

  const result: PruneResult = {
    adminLogsDeleted: admin.deleted,
    securityLogsDeleted: security.deleted,
    moreRemaining: admin.moreRemaining || security.moreRemaining,
  };

  if (result.adminLogsDeleted || result.securityLogsDeleted) {
    logger.info('Pruned audit logs', result);
  }
  if (result.moreRemaining) {
    // Worth saying out loud: it means a backlog exists and the schedule alone
    // will take several runs to clear it.
    logger.warn(
      'Audit pruning hit its per-run batch cap — a backlog remains and the next run will continue.'
    );
  }

  return result;
}
