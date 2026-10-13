import prisma from '../../lib/prisma.js';
import { redlock } from '../../services/cacheService.js';
import { createAppError } from '../../utils/errorHandler.js';
import logger from '../../utils/logger.js';
import { isUuid } from '../../utils/slugify.js';

/**
 * True when a Redlock failure was caused by the resource genuinely being held,
 * and false when it was caused by the lock store being unreachable.
 *
 * Redlock 5 reports both as `ExecutionError`. What differs is the reason each
 * client voted against, which lives in `ExecutionStats.votesAgainst` — a Map of
 * client → Error. A held resource produces `ResourceLockedError`; an
 * unreachable Redis produces an ordinary connection `Error`.
 *
 * Unknown shapes are treated as NOT contention. That is the safer default: a
 * 503 tells the truth about an outage, while a wrong 409 tells the user to
 * retry something that cannot succeed.
 */
async function isPureContention(err: unknown): Promise<boolean> {
  const attempts = (err as { attempts?: unknown }).attempts;
  if (!Array.isArray(attempts) || attempts.length === 0) return false;

  try {
    const stats = await Promise.all(
      attempts.map((a) => Promise.resolve(a).catch(() => null))
    );
    const reasons = stats.flatMap((s) => {
      const against = (s as { votesAgainst?: Map<unknown, Error> } | null)
        ?.votesAgainst;
      return against instanceof Map ? [...against.values()] : [];
    });
    if (reasons.length === 0) return false;
    return reasons.every((r) => r?.name === 'ResourceLockedError');
  } catch {
    return false;
  }
}

// ─── ID resolver (UUID or slug → UUID) ────────────────────────────────────

export async function resolveBattleId(idOrSlug: string): Promise<string> {
  if (isUuid(idOrSlug)) return idOrSlug;
  const battle = await prisma.battle.findFirst({
    where: { slug: idOrSlug },
    select: { id: true },
  });
  if (!battle) throw createAppError('Battle not found', 404);
  return battle.id;
}

// ─── Lock helper ──────────────────────────────────────────────────────────

export async function withBattleLock<T>(
  battleId: string,
  ttlMs: number,
  callback: () => Promise<T>,
  opts: { lockKeySuffix?: string; retryCount?: number } = {}
): Promise<T> {
  // A per-user suffix lets different players act on the same battle
  // concurrently while still serializing a single user's own concurrent
  // requests (e.g. double-tapping submit on the same answer).
  const resource = opts.lockKeySuffix
    ? `battle:lock:${battleId}:${opts.lockKeySuffix}`
    : `battle:lock:${battleId}`;
  // retryCount 0 = fail fast — correct for single-actor admin actions (start /
  // complete). High-concurrency paths (answer submission during a live battle)
  // pass a retryCount so legitimate concurrent requests queue for the lock
  // instead of erroring out.
  // Losing the race for the lock is a normal outcome under concurrency (two
  // players tapping "start" on the same battle), not a server fault. Redlock
  // surfaces it as an ExecutionError, which used to escape as a raw 500 with
  // "unable to achieve a quorum" in the response body. Translate it to 409.
  //
  // 🔴 BUT NOT EVERY ExecutionError IS A LOST RACE. Redlock raises the same
  // error class when it cannot reach Redis at all, and answering 409 to that
  // tells the user a rival is mid-action — a cause that does not exist —
  // and invites a retry that can never succeed. Production has been serving
  // exactly this: `/api/v1/health` reports `redis: error`, so every start and
  // every answer submission returned "Another action on this battle is
  // already in progress" with nothing else on the battle at all.
  //
  // The two are distinguishable in the error itself. Measured against
  // redlock 5.0.0-beta.2 with a live server and with a dead port:
  //   lost race   → votesAgainst: [ ResourceLockedError ]
  //   redis down  → votesAgainst: [ Error: Connection is closed. ]
  // So: contention only when EVERY vote against is a ResourceLockedError.
  let lock;
  try {
    lock = await redlock.acquire([resource], ttlMs, {
      retryCount: opts.retryCount ?? 0,
    });
  } catch (err) {
    const name = (err as Error)?.name;
    if (name === 'ExecutionError' || name === 'LockError') {
      const contended = await isPureContention(err);
      if (contended) {
        throw createAppError(
          'Another action on this battle is already in progress — try again.',
          409
        );
      }
      logger.error('Battle lock unavailable — the lock store is unreachable', {
        resource,
        err,
      });
      throw createAppError(
        'Battle actions are temporarily unavailable. Please try again shortly.',
        503
      );
    }
    throw err;
  }
  try {
    return await callback();
  } finally {
    // Release if it hasn't expired
    await lock.release().catch((err: Error & { name?: string }) => {
      const errorName = err.name;
      // Only log if it's not a 'lock already released/expired' error
      if (errorName !== 'LockError') {
        logger.warn(`Failed to release lock for ${resource}`, { err });
      }
    });
  }
}
