import { describe, it, expect } from '@jest/globals';
import {
  computeEloUpdates,
  DEFAULT_K_FACTOR,
  RatingPlayer,
} from '../../services/rating/ratingMath';

const sumDeltas = (updates: { delta: number }[]) =>
  updates.reduce((s, u) => s + u.delta, 0);

describe('computeEloUpdates', () => {
  it('1-v-1 equal ratings: winner +K/2, loser -K/2, zero-sum', () => {
    const players: RatingPlayer[] = [
      { userId: 'w', rating: 1200, rank: 1 },
      { userId: 'l', rating: 1200, rank: 2 },
    ];
    const updates = computeEloUpdates(players);
    const w = updates.find((u) => u.userId === 'w')!;
    const l = updates.find((u) => u.userId === 'l')!;
    expect(w.delta).toBe(DEFAULT_K_FACTOR / 2); // 16
    expect(l.delta).toBe(-DEFAULT_K_FACTOR / 2); // -16
    expect(w.newRating).toBe(1216);
    expect(sumDeltas(updates)).toBe(0);
  });

  it('a tie yields no rating change for equal players', () => {
    const updates = computeEloUpdates([
      { userId: 'a', rating: 1200, rank: 1 },
      { userId: 'b', rating: 1200, rank: 1 },
    ]);
    expect(updates.every((u) => u.delta === 0)).toBe(true);
  });

  it('a favourite winning gains less than an underdog would', () => {
    const favouriteWins = computeEloUpdates([
      { userId: 'fav', rating: 1400, rank: 1 },
      { userId: 'dog', rating: 1200, rank: 2 },
    ]);
    const favGain = favouriteWins.find((u) => u.userId === 'fav')!.delta;

    const underdogWins = computeEloUpdates([
      { userId: 'fav', rating: 1400, rank: 2 },
      { userId: 'dog', rating: 1200, rank: 1 },
    ]);
    const dogGain = underdogWins.find((u) => u.userId === 'dog')!.delta;

    expect(favGain).toBeGreaterThan(0);
    expect(dogGain).toBeGreaterThan(favGain); // upset is rewarded more
  });

  it('ranks a 3-player battle: 1st gains, last loses, middle in between', () => {
    const updates = computeEloUpdates([
      { userId: 'first', rating: 1200, rank: 1 },
      { userId: 'mid', rating: 1200, rank: 2 },
      { userId: 'last', rating: 1200, rank: 3 },
    ]);
    const d = (id: string) => updates.find((u) => u.userId === id)!.delta;
    expect(d('first')).toBeGreaterThan(0);
    expect(d('last')).toBeLessThan(0);
    expect(d('first')).toBeGreaterThan(d('mid'));
    expect(d('mid')).toBeGreaterThan(d('last'));
  });

  it('normalizes by opponent count so deltas stay bounded by K', () => {
    const players: RatingPlayer[] = Array.from({ length: 6 }, (_, i) => ({
      userId: `p${i}`,
      rating: 1200,
      rank: i + 1,
    }));
    const updates = computeEloUpdates(players);
    for (const u of updates) {
      expect(Math.abs(u.delta)).toBeLessThanOrEqual(DEFAULT_K_FACTOR);
    }
  });

  it('does not change a solo player', () => {
    const updates = computeEloUpdates([{ userId: 'solo', rating: 1300, rank: 1 }]);
    expect(updates).toEqual([
      { userId: 'solo', oldRating: 1300, newRating: 1300, delta: 0 },
    ]);
  });
});
