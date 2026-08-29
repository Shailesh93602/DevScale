/**
 * The admin audit trail: one record per privileged mutation, written in the
 * SAME TRANSACTION as the change it describes.
 *
 * WHY A TRANSACTION, AND NOT JUST A CALL AFTER THE MUTATION.
 *
 * The previous shape was:
 *
 *     const user = await repo.updateUserRole(...);   // commits
 *     await auditRepo.logAdminAction({...});          // separate write
 *
 * Two independent writes, which fails in two directions:
 *
 *   1. A crash, deploy, or connection drop between them leaves a privileged
 *      change with NO record of who made it — exactly the case an audit trail
 *      exists to make impossible. The gap is small and therefore easy to
 *      dismiss; audit trails are read precisely when someone is arguing about
 *      whether an action happened, and "usually recorded" is not an answer.
 *
 *   2. 🔴 `logAdminAction` threw a 500 when the insert failed — AFTER the
 *      mutation had committed. So a transient audit failure reported failure
 *      for work that had actually been done, and the natural response to a 500
 *      is to retry. On `DELETE /users/:id` that is a retry of a destructive,
 *      non-idempotent operation.
 *
 * Running both inside `prisma.$transaction` makes the pair atomic: the change
 * and its record commit together or not at all. A failed audit write now rolls
 * the mutation back, so the 500 becomes TRUE — nothing happened, and retrying
 * is safe and correct.
 *
 * "No log means no action" is only a real guarantee when it is enforced by the
 * database rather than by the order of two awaits.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO.
 *
 * It does not cover work that cannot join a transaction — an external API call,
 * a file write, a Supabase `app_metadata` sync. Those are recorded after the
 * fact and are honestly weaker; the ones that matter say so at their call site
 * rather than pretending to a guarantee they do not have.
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import type { AuditLogParams } from '../types/index.js';

/** A Prisma client scoped to the open transaction. */
export type Tx = Prisma.TransactionClient;

export interface AuditEntry {
  /** Who did it. */
  admin_id: string;
  /** What they did — a stable verb, e.g. UPDATE_USER_ROLE. */
  action: string;
  /** What kind of thing it happened to, e.g. USER. */
  entity: string;
  /** Which one. */
  entity_id: string;
  /**
   * The specifics. Keep this to what someone reading the trail six months from
   * now would need: the values that changed, not the whole request body — a
   * request body is how a password or an API key ends up in a log that is, by
   * design, kept for a long time and read by more people than the request was.
   */
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Run a privileged mutation and record it atomically.
 *
 * The callback receives the transaction client and MUST use it for its writes —
 * a write issued on the global `prisma` instead would run outside the
 * transaction and silently lose the guarantee this function exists to provide.
 *
 * The audit row is written AFTER the callback so the entry can describe the
 * result (a generated id, the value actually stored). Both are still inside the
 * same transaction, so the ordering costs nothing.
 */
export async function withAudit<T>(
  entry: AuditEntry | ((result: T) => AuditEntry),
  mutate: (tx: Tx) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    const result = await mutate(tx);
    const record = typeof entry === 'function' ? entry(result) : entry;

    await tx.adminAuditLog.create({
      data: {
        admin_id: record.admin_id,
        action: record.action,
        entity: record.entity,
        entity_id: record.entity_id,
        details: record.details
          ? (record.details as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip_address: record.ip_address,
        user_agent: record.user_agent,
      },
    });

    return result;
  });
}

/**
 * Record an action that could NOT be made transactional — a read-shaped
 * operation, or one whose effect lives outside this database.
 *
 * Named so the weaker guarantee is visible at the call site. It never throws:
 * failing a completed, unrollbackable action because its record could not be
 * written is the exact bug this module was written to remove, and here there is
 * nothing to roll back.
 */
export async function recordActionBestEffort(
  entry: AuditEntry,
  logger: { error: (msg: string, meta?: unknown) => void }
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        admin_id: entry.admin_id,
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entity_id,
        details: entry.details
          ? (entry.details as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
      },
    });
  } catch (error) {
    logger.error('Audit write failed for a non-transactional action', {
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      error,
    });
  }
}

/** Kept so existing AuditLogParams call sites type-check against AuditEntry. */
export type { AuditLogParams };
