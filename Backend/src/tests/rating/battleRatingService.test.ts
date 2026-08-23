import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockLbFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockUrFindMany = jest.fn<(...args: unknown[]) => Promise<unknown>>();
const mockUpsert = jest.fn<(...args: unknown[]) => unknown>();
const mockTransaction = jest.fn<(...args: unknown[]) => Promise<unknown>>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    battleLeaderboard: { findMany: (...a: unknown[]) => mockLbFindMany(...a) },
    userRating: {
      findMany: (...a: unknown[]) => mockUrFindMany(...a),
      upsert: (...a: unknown[]) => mockUpsert(...a),
    },
    $transaction: (...a: unknown[]) => mockTransaction(...a),
    $disconnect: jest.fn(),
  },
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { status: 'end', quit: jest.fn() },
}));

import { BattleRatingService } from '../../services/rating/battleRatingService';

const svc = new BattleRatingService();

type UpsertArg = {
  where: { user_id: string };
  create: Record<string, unknown>;
  update: Record<string, unknown>;
};
const upsertFor = (userId: string): UpsertArg =>
  mockUpsert.mock.calls
    .map((c) => c[0] as UpsertArg)
    .find((a) => a.where.user_id === userId)!;

beforeEach(() => {
  mockLbFindMany.mockReset();
  mockUrFindMany.mockReset();
  mockUpsert.mockReset().mockImplementation((arg: unknown) => arg);
  mockTransaction.mockReset().mockImplementation(async (ops: unknown) => ops);
});

describe('BattleRatingService.applyBattleResult', () => {
  it('does not rate a solo battle (< 2 players)', async () => {
    mockLbFindMany.mockResolvedValue([{ user_id: 'a', rank: 1 }]);
    const result = await svc.applyBattleResult('b1');
    expect(result).toEqual([]);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('rates new (unrated) players from the default and records the win', async () => {
    mockLbFindMany.mockResolvedValue([
      { user_id: 'w', rank: 1 },
      { user_id: 'l', rank: 2 },
    ]);
    mockUrFindMany.mockResolvedValue([]); // both unrated → default 1200

    const result = await svc.applyBattleResult('b1');

    const w = result.find((u) => u.userId === 'w')!;
    const l = result.find((u) => u.userId === 'l')!;
    expect(w.delta).toBe(16);
    expect(w.newRating).toBe(1216);
    expect(l.delta).toBe(-16);

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    // winner's create row records the win + new rating
    expect(upsertFor('w').create).toMatchObject({
      user_id: 'w',
      rating: 1216,
      games_played: 1,
      wins: 1,
      losses: 0,
      peak_rating: 1216,
    });
    expect(upsertFor('l').create).toMatchObject({ wins: 0, losses: 1 });
  });

  it('uses stored ratings as the base and keeps the prior peak', async () => {
    mockLbFindMany.mockResolvedValue([
      { user_id: 'fav', rank: 1 },
      { user_id: 'dog', rank: 2 },
    ]);
    mockUrFindMany.mockResolvedValue([
      { user_id: 'fav', rating: 1400, peak_rating: 1450 },
      { user_id: 'dog', rating: 1200, peak_rating: 1200 },
    ]);

    const result = await svc.applyBattleResult('b1');

    const fav = result.find((u) => u.userId === 'fav')!;
    expect(fav.oldRating).toBe(1400);
    expect(fav.delta).toBe(8); // favourite winning gains less
    expect(fav.newRating).toBe(1408);
    // peak stays at the higher prior value
    expect(upsertFor('fav').update.peak_rating).toBe(1450);
  });
});
