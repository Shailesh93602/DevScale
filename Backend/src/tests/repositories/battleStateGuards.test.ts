// eduscale-backend#23-04, #23-05, #23-11, #25-04, #28-05 — battle state guards.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type Fn = (...args: unknown[]) => Promise<unknown>;
const tx = {
  battle: {
    findUnique: jest.fn<Fn>(),
    findUniqueOrThrow: jest.fn<Fn>(),
    update: jest.fn<Fn>(),
    updateMany: jest.fn<Fn>(),
    count: jest.fn<Fn>(),
  },
  battleParticipant: {
    findUnique: jest.fn<Fn>(),
    create: jest.fn<Fn>(),
    delete: jest.fn<Fn>(),
    update: jest.fn<Fn>(),
    updateMany: jest.fn<Fn>(),
  },
  battleQuestion: { findUnique: jest.fn<Fn>() },
  battleAnswer: { findUnique: jest.fn<Fn>(), create: jest.fn<Fn>() },
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    ...tx,
    $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
  },
}));
jest.mock('../../repositories/battle/lock', () => ({
  resolveBattleId: async (id: string) => id,
  withBattleLock: (_id: string, _ttl: number, fn: () => unknown) => fn(),
}));
const emitToRoom = jest.fn();
jest.mock('../../services/socket', () => ({
  __esModule: true,
  default: { emitToRoom: (...a: unknown[]) => emitToRoom(...a) },
}));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { joinBattle, leaveBattle } from '../../repositories/battle/lifecycle';
import { submitAnswer } from '../../repositories/battle/gameplay';
import { battleSocketService } from '../../services/battleSocket';
import { createBattleValidationSchema } from '../../validations/battleValidations';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('joinBattle', () => {
  it('refuses the join when the conditional seat claim matches no row (full)', async () => {
    tx.battle.findUnique.mockResolvedValue({
      status: 'WAITING',
      current_participants: 1,
      max_participants: 2,
    });
    tx.battleParticipant.findUnique.mockResolvedValue(null);
    tx.battle.updateMany.mockResolvedValue({ count: 0 });
    await expect(joinBattle('b1', 'u2')).rejects.toMatchObject({
      message: 'Battle is full',
    });
    expect(tx.battleParticipant.create).not.toHaveBeenCalled();
  });
});

describe('leaveBattle', () => {
  it.each(['COMPLETED', 'CANCELLED'])(
    'refuses to delete a participant of a %s battle',
    async (status) => {
      tx.battleParticipant.findUnique.mockResolvedValue({ id: 'p1' });
      tx.battle.findUnique.mockResolvedValue({ status });
      await expect(leaveBattle('b1', 'u1')).rejects.toMatchObject({
        statusCode: 409,
      });
      expect(tx.battleParticipant.delete).not.toHaveBeenCalled();
      expect(tx.battle.update).not.toHaveBeenCalled();
    }
  );
});

describe('submitAnswer', () => {
  it('refuses an answer that reaches the lock after the battle completed', async () => {
    tx.battle.findUnique.mockResolvedValue({ status: 'COMPLETED' });
    tx.battleParticipant.findUnique.mockResolvedValue({ status: 'COMPLETED' });
    tx.battleQuestion.findUnique.mockResolvedValue({
      id: 'q1',
      battle_id: 'b1',
      correct_answer: 0,
      points: 100,
      time_limit: 30,
    });
    tx.battleAnswer.findUnique.mockResolvedValue(null);
    await expect(submitAnswer('b1', 'q1', 'u1', 0, 1000)).rejects.toMatchObject(
      {
        statusCode: 409,
      }
    );
    expect(tx.battleAnswer.create).not.toHaveBeenCalled();
  });
});

describe('scheduled battle timers', () => {
  it('do not reopen a battle that was cancelled before the lobby timer fired', async () => {
    tx.battle.updateMany.mockResolvedValue({ count: 0 });
    tx.battle.update.mockResolvedValue({ type: 'SCHEDULED', start_time: null });
    await battleSocketService.transitionToLobby('b1');
    expect(tx.battle.update).not.toHaveBeenCalled();
    expect(emitToRoom).not.toHaveBeenCalled();
  });

  it('do not start a battle that is no longer IN_PROGRESS', async () => {
    tx.battle.count.mockResolvedValue(0);
    tx.battle.update.mockResolvedValue({});
    await battleSocketService.startBattle('b1');
    expect(tx.battle.update).not.toHaveBeenCalled();
    expect(emitToRoom).not.toHaveBeenCalled();
    battleSocketService.cleanup('b1');
  });
});

describe('createBattleValidationSchema.start_time', () => {
  it('measures "5 minutes from now" at validation time, not at module load', () => {
    // 30 min ahead of the real clock: valid at boot, in the past an hour later.
    const startTime = new Date(Date.now() + 30 * 60_000).toISOString();
    const now = jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 3600_000);
    const { error } = createBattleValidationSchema.validate({
      title: 'Scheduled',
      type: 'SCHEDULED',
      difficulty: 'EASY',
      topic_id: '00000000-0000-0000-0000-000000000000',
      start_time: startTime,
    });
    now.mockRestore();
    expect(error?.details.map((d) => d.path.join('.'))).toContain('start_time');
  });
});
