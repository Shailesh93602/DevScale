/**
 * Applies Elo updates after a battle completes (Feature 4). Reads the final
 * standings (BattleLeaderboard), computes rank-based Elo deltas, and persists
 * each player's UserRating in a single transaction. Solo battles (< 2 players)
 * are not rated. Best-effort from the caller's view — a failure here must never
 * break battle completion.
 */

import prisma from '../../lib/prisma.js';
import {
  computeEloUpdates,
  DEFAULT_RATING,
  RatingPlayer,
  RatingUpdate,
} from './ratingMath.js';

export class BattleRatingService {
  async applyBattleResult(battleId: string): Promise<RatingUpdate[]> {
    const entries = await prisma.battleLeaderboard.findMany({
      where: { battle_id: battleId },
      select: { user_id: true, rank: true },
      orderBy: { rank: 'asc' },
    });
    if (entries.length < 2) return []; // no rating change in a solo battle

    const userIds = entries.map((e) => e.user_id);
    const existing = await prisma.userRating.findMany({
      where: { user_id: { in: userIds } },
    });
    const ratingByUser = new Map(existing.map((r) => [r.user_id, r.rating]));
    const peakByUser = new Map(existing.map((r) => [r.user_id, r.peak_rating]));

    const players: RatingPlayer[] = entries.map((e) => ({
      userId: e.user_id,
      rating: ratingByUser.get(e.user_id) ?? DEFAULT_RATING,
      rank: e.rank,
    }));

    const updates = computeEloUpdates(players);
    const rankByUser = new Map(entries.map((e) => [e.user_id, e.rank]));

    await prisma.$transaction(
      updates.map((u) => {
        const won = rankByUser.get(u.userId) === 1;
        const priorPeak = peakByUser.get(u.userId) ?? u.newRating;
        return prisma.userRating.upsert({
          where: { user_id: u.userId },
          create: {
            user_id: u.userId,
            rating: u.newRating,
            games_played: 1,
            wins: won ? 1 : 0,
            losses: won ? 0 : 1,
            peak_rating: u.newRating,
          },
          update: {
            rating: u.newRating,
            games_played: { increment: 1 },
            wins: { increment: won ? 1 : 0 },
            losses: { increment: won ? 0 : 1 },
            peak_rating: Math.max(u.newRating, priorPeak),
          },
        });
      })
    );

    return updates;
  }
}
