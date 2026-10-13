import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { creatorSelect } from './battleShapes.js';

// ─── Scoring helper ────────────────────────────────────────────────────────

/**
 * Calculate points earned for a correct answer based on speed.
 * Speed bonus tiers (based on fraction of time limit used):
 *   ≤25% → +50%   (×1.5)
 *   ≤50% → +25%   (×1.25)
 *   ≤75% → ±0%    (×1.0)
 *   ≤100% → -25%  (×0.75)
 * Wrong answers always score 0.
 */
export function calculatePoints(
  isCorrect: boolean,
  basePoints: number,
  timeTakenMs: number,
  timeLimitSeconds: number
): number {
  if (!isCorrect) return 0;
  const timeLimitMs = timeLimitSeconds * 1000;
  const fraction = Math.min(timeTakenMs / timeLimitMs, 1);

  let multiplier: number;
  if (fraction <= 0.25) multiplier = 1.5;
  else if (fraction <= 0.5) multiplier = 1.25;
  else if (fraction <= 0.75) multiplier = 1;
  else multiplier = 0.75;

  return Math.floor(basePoints * multiplier);
}

// ─── Leaderboard helper ────────────────────────────────────────────────────

// Accepts the active client. When called INSIDE a transaction, the caller must
// pass its `tx` client — otherwise this issues a separate query needing a 2nd
// pooled connection, which deadlocks the transaction on a small pool (the
// DIRECT_URL default is connection_limit=1).
export async function buildLeaderboard(
  battleId: string,
  client: Prisma.TransactionClient = prisma
) {
  const participants = await client.battleParticipant.findMany({
    where: { battle_id: battleId },
    include: { user: { select: creatorSelect } },
    orderBy: [{ score: 'desc' }, { avg_time_per_answer_ms: 'asc' }],
  });

  return participants.map((p, idx) => ({
    user_id: p.user_id,
    username: p.user.username,
    avatar_url: p.user.avatar_url,
    score: p.score,
    rank: idx + 1,
    correct_count: p.correct_count,
    total_time_ms: p.avg_time_per_answer_ms * (p.correct_count + p.wrong_count),
  }));
}
