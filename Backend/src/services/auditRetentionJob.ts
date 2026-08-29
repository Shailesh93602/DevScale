import Queue from 'bull';

import { pruneAuditLogs } from './auditRetention.js';
import logger from '../utils/logger.js';

/**
 * Schedules the audit-log retention sweep.
 *
 * WHY THIS FILE EXISTS.
 *
 * `pruneAuditLogs` was written alongside the audit trail and then never called
 * from anywhere. A retention policy nothing invokes is not a policy — it is a
 * function with a good comment, while the table grows forever exactly as if it
 * had never been written. That is the same failure as a test suite CI does not
 * run, and it was mine.
 *
 * WHY BULL'S REPEATABLE JOB AND NOT `setInterval`.
 *
 * 🔴 This app runs under PM2 in cluster mode with `instances: 'max'`. A
 * `setInterval` in the process would fire once PER WORKER — on an 8-core box
 * that is eight concurrent DELETE sweeps against the same rows, every night.
 *
 * Bull dedupes repeatable jobs by key in Redis, so every worker registering the
 * same schedule produces ONE scheduled job, and exactly one worker processes
 * each occurrence. Registering from all of them is therefore safe, and is what
 * makes this correct under clustering rather than merely working on one
 * machine.
 *
 * WHY A NIGHTLY SWEEP RATHER THAN PRUNING ON WRITE.
 *
 * Pruning on insert would put a delete in the path of every privileged action,
 * so the cost of RECORDING an action would grow with the history. A nightly
 * sweep keeps writes constant-time and bounds the table just as well.
 */

const RETENTION_QUEUE = 'audit-retention';

/** 03:40 UTC — off the hour, so it does not collide with other schedules. */
const SCHEDULE_CRON = '40 3 * * *';

let queue: Queue.Queue | null = null;

export function startAuditRetentionJob(redisUrl: string): Queue.Queue | null {
  if (queue) return queue;

  try {
    queue = new Queue(RETENTION_QUEUE, redisUrl);

    queue.process(async () => {
      const result = await pruneAuditLogs();
      logger.info('Audit retention sweep finished', result);
      return result;
    });

    // `removeOnComplete` because the point of this job is to stop a table
    // growing without bound; leaving its own completed records to accumulate in
    // Redis would be a small joke at our own expense.
    void queue.add(
      {},
      {
        repeat: { cron: SCHEDULE_CRON },
        removeOnComplete: true,
        removeOnFail: 50,
      }
    );

    queue.on('failed', (_job, err) => {
      // Loud on purpose. An unbounded audit table is the kind of problem that
      // is invisible until it is expensive, so a silent failure here costs more
      // than the failure itself.
      logger.error('Audit retention sweep FAILED', { error: err?.message });
    });

    logger.info(`Audit retention scheduled (${SCHEDULE_CRON} UTC)`);
    return queue;
  } catch (error) {
    // Never take the server down over this. The sweep is maintenance; refusing
    // to boot because Redis is briefly unavailable would trade a slow-growing
    // table for an outage.
    logger.error('Could not schedule audit retention', { error });
    return null;
  }
}

/** Test/diagnostics helper. */
export async function _stopAuditRetentionJob(): Promise<void> {
  if (queue) {
    await queue.close();
    queue = null;
  }
}
