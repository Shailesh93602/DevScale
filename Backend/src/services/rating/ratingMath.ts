/**
 * Rank-based multiplayer Elo (Feature 4). A battle's final standings become a
 * set of pairwise comparisons: each player is scored against every other player
 * (win = 1, tie = 0.5, loss = 0), the expected score comes from the standard Elo
 * logistic, and the delta is normalized by the number of opponents so a 6-player
 * battle doesn't swing ratings 5× harder than a 1-v-1. Pure + deterministic.
 */

export interface RatingPlayer {
  userId: string;
  rating: number;
  /** 1-based finishing position; lower is better. Ties share a rank. */
  rank: number;
}

export interface RatingUpdate {
  userId: string;
  oldRating: number;
  newRating: number;
  delta: number;
}

export const DEFAULT_RATING = 1200;
export const DEFAULT_K_FACTOR = 32;

/** Probability that rating `a` beats rating `b`. */
function expectedScore(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

export function computeEloUpdates(
  players: RatingPlayer[],
  kFactor: number = DEFAULT_K_FACTOR
): RatingUpdate[] {
  const n = players.length;
  if (n < 2) {
    return players.map((p) => ({
      userId: p.userId,
      oldRating: p.rating,
      newRating: p.rating,
      delta: 0,
    }));
  }

  return players.map((p) => {
    let expected = 0;
    let actual = 0;
    for (const opponent of players) {
      if (opponent.userId === p.userId) continue;
      expected += expectedScore(p.rating, opponent.rating);
      if (p.rank < opponent.rank) actual += 1;
      else if (p.rank === opponent.rank) actual += 0.5;
    }
    const delta = Math.round((kFactor * (actual - expected)) / (n - 1));
    return {
      userId: p.userId,
      oldRating: p.rating,
      newRating: p.rating + delta,
      delta,
    };
  });
}
