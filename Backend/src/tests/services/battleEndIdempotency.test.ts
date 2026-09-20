/**
 * `endBattle` is reached more than once for a single battle, routinely, and the
 * thing it calls is not idempotent.
 *
 * TWO CALLERS, ONE BATTLE:
 *
 *   1. `handleAnswerSubmitted` — awaits `checkAllParticipantsDone` (a database
 *      round trip) and only clears the question timer AFTER that await
 *      resolves. The timer can fire inside that window.
 *   2. the `setTimeout` in `broadcastQuestion` — runs its own
 *      `checkAllParticipantsDone` and ends the battle if everyone is done.
 *
 * And separately, in the ordinary two-player case: both players answer the last
 * question at about the same moment, the per-battle Redlock serializes the two
 * `submitAnswer` transactions, then BOTH handlers ask "is everyone done?" after
 * their lock is released and both get `true`.
 *
 * WHY THAT CORRUPTS DATA: `battleRatingService.applyBattleResult` writes
 * `games_played: { increment: 1 }`, increments `wins`/`losses`, and recomputes
 * Elo from each player's CURRENT rating. A second call is not a harmless
 * repeat — it applies a second delta on top of the first and inflates every
 * player's record permanently.
 *
 * The lock never prevented this. It serialized the two completions; it did not
 * deduplicate them.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCompleteBattle = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockApplyBattleResult =
  jest.fn<(...a: unknown[]) => Promise<unknown[]>>();
const mockEmitToRoom = jest.fn<(...a: unknown[]) => void>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { battle: { findUnique: jest.fn(), update: jest.fn() } },
}));

jest.mock('../../services/socket', () => ({
  __esModule: true,
  default: {
    emitToRoom: (...a: unknown[]) => mockEmitToRoom(...a),
    emitToUser: jest.fn(),
  },
}));

jest.mock('../../repositories/battleRepository', () => ({
  __esModule: true,
  BattleRepository: class {
    completeBattle = (...a: unknown[]) => mockCompleteBattle(...a);
    checkAllParticipantsDone = jest.fn();
  },
}));

jest.mock('../../services/rating/battleRatingService', () => ({
  __esModule: true,
  BattleRatingService: class {
    applyBattleResult = (...a: unknown[]) => mockApplyBattleResult(...a);
  },
}));

import battleSocketService from '../../services/battleSocket';

const BATTLE_ID = 'battle-1';
const RESULT = {
  battle: { winner_id: 'player-a' },
  leaderboard: [{ user_id: 'player-a' }],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('endBattle — ratings are applied exactly once per battle', () => {
  it('applies ratings when this call performed the transition', async () => {
    mockCompleteBattle.mockResolvedValue({
      ...RESULT,
      alreadyCompleted: false,
    } as never);

    await battleSocketService.endBattle(BATTLE_ID);

    expect(mockApplyBattleResult).toHaveBeenCalledTimes(1);
    expect(mockEmitToRoom).toHaveBeenCalledWith(
      BATTLE_ID,
      'battle:completed',
      expect.anything()
    );
  });

  it('does NOT apply ratings again when the battle was already COMPLETED', async () => {
    mockCompleteBattle.mockResolvedValue({
      ...RESULT,
      alreadyCompleted: true,
    } as never);

    await battleSocketService.endBattle(BATTLE_ID);

    expect(mockApplyBattleResult).not.toHaveBeenCalled();
  });

  it('two concurrent callers produce exactly one rating update', async () => {
    // The real sequence: whoever gets there first wins the compare-and-set and
    // sees alreadyCompleted false; everyone after sees true.
    let first = true;
    mockCompleteBattle.mockImplementation(async () => {
      const wonTheRace = first;
      first = false;
      return { ...RESULT, alreadyCompleted: !wonTheRace };
    });

    await Promise.all([
      battleSocketService.endBattle(BATTLE_ID),
      battleSocketService.endBattle(BATTLE_ID),
    ]);

    expect(mockCompleteBattle).toHaveBeenCalledTimes(2);
    expect(mockApplyBattleResult).toHaveBeenCalledTimes(1);
    // And the players are told the battle is over exactly once.
    const completedBroadcasts = mockEmitToRoom.mock.calls.filter(
      (c) => c[1] === 'battle:completed'
    );
    expect(completedBroadcasts).toHaveLength(1);
  });
});
