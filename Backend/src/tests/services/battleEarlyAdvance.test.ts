// BATTLE_EARLY_ADVANCE: advance once everyone answered, exactly once, and never when the flag is off.
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';

const mockEmitToRoom = jest.fn<(...a: unknown[]) => void>();
const mockFindQuestions = jest.fn<(...a: unknown[]) => Promise<unknown[]>>();
const mockAllAnswered = jest.fn<(...a: unknown[]) => Promise<boolean>>();
const mockAllDone = jest.fn<(...a: unknown[]) => Promise<boolean>>();
const mockCompleteBattle = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockApplyBattleResult = jest.fn<(...a: unknown[]) => Promise<void>>();

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    battleQuestion: { findMany: (...a: unknown[]) => mockFindQuestions(...a) },
  },
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
    allActivePlayersAnswered = (...a: unknown[]) => mockAllAnswered(...a);
    checkAllParticipantsDone = (...a: unknown[]) => mockAllDone(...a);
    completeBattle = (...a: unknown[]) => mockCompleteBattle(...a);
  },
}));

jest.mock('../../services/rating/battleRatingService', () => ({
  __esModule: true,
  BattleRatingService: class {
    applyBattleResult = (...a: unknown[]) => mockApplyBattleResult(...a);
  },
}));

import battleSocketService, {
  EARLY_ADVANCE_REVEAL_MS,
} from '../../services/battleSocket';

const TIME_LIMIT_S = 30;
const EXPIRY_MS = TIME_LIMIT_S * 1000 + 500;
const QUESTIONS = [0, 1, 2].map((i) => ({
  id: `q${i}`,
  time_limit: TIME_LIMIT_S,
}));
const RESULT = {
  is_correct: true,
  points_earned: 10,
  correct_answer: 0,
  leaderboard: [],
  participant_done: false,
};

let battleId = '';
let seq = 0;

function questionIndexes(): number[] {
  return mockEmitToRoom.mock.calls
    .filter((c) => c[0] === battleId && c[1] === 'battle:question')
    .map((c) => (c[2] as { index: number }).index);
}

function answer(userId = 'u1') {
  return battleSocketService.handleAnswerSubmitted(battleId, userId, RESULT);
}

beforeEach(async () => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  battleId = `battle-${++seq}`;
  mockFindQuestions.mockResolvedValue(QUESTIONS);
  mockAllDone.mockResolvedValue(false);
  mockAllAnswered.mockResolvedValue(true);
  mockCompleteBattle.mockResolvedValue({
    battle: { winner_id: 'u1' },
    leaderboard: [],
    alreadyCompleted: false,
  });
  process.env.BATTLE_EARLY_ADVANCE = 'true';
  await battleSocketService.broadcastQuestion(battleId, 0);
});

afterEach(() => {
  battleSocketService.cleanup(battleId);
  delete process.env.BATTLE_EARLY_ADVANCE;
  jest.useRealTimers();
});

describe('flag on', () => {
  it('advances after the reveal pause once everyone has answered', async () => {
    await answer();
    expect(mockAllAnswered).toHaveBeenCalledWith(battleId, 'q0');
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS - 1);
    expect(questionIndexes()).toEqual([0]);
    await jest.advanceTimersByTimeAsync(1);
    expect(questionIndexes()).toEqual([0, 1]);
  });

  it('two answers arriving at once advance exactly once', async () => {
    await Promise.all([answer('u1'), answer('u2')]);
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS);
    expect(questionIndexes()).toEqual([0, 1]);
  });

  it('cancels the old timer: question 1 keeps its full time', async () => {
    await answer();
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS);
    // The cancelled Q0 timer would have fired here and skipped to Q2.
    await jest.advanceTimersByTimeAsync(EXPIRY_MS - 1);
    expect(questionIndexes()).toEqual([0, 1]);
    await jest.advanceTimersByTimeAsync(1);
    expect(questionIndexes()).toEqual([0, 1, 2]);
  });

  it('the timer and a late "all answered" do not both advance', async () => {
    let resolve!: (v: boolean) => void;
    mockAllAnswered.mockReturnValueOnce(
      new Promise<boolean>((r) => {
        resolve = r;
      })
    );
    const pending = answer();
    await jest.advanceTimersByTimeAsync(EXPIRY_MS);
    expect(questionIndexes()).toEqual([0, 1]);
    resolve(true);
    await pending;
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS);
    expect(questionIndexes()).toEqual([0, 1]);
  });

  it('a late "all answered" landing mid-advance does not advance again', async () => {
    let lateAnswered!: (v: boolean) => void;
    let questionsLoaded!: (v: unknown[]) => void;
    mockAllAnswered.mockReturnValueOnce(
      new Promise<boolean>((r) => {
        lateAnswered = r;
      })
    );
    const late = answer('u2');
    await answer('u1');
    mockFindQuestions.mockReturnValueOnce(
      new Promise<unknown[]>((r) => {
        questionsLoaded = r;
      })
    );
    // The advance is now between its claim and broadcasting question 1.
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS);
    lateAnswered(true);
    await late;
    questionsLoaded(QUESTIONS);
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS);
    expect(questionIndexes()).toEqual([0, 1]);
  });

  it('waits for the timer while someone has not answered', async () => {
    mockAllAnswered.mockResolvedValue(false);
    await answer();
    await jest.advanceTimersByTimeAsync(EXPIRY_MS - 1);
    expect(questionIndexes()).toEqual([0]);
    await jest.advanceTimersByTimeAsync(1);
    expect(questionIndexes()).toEqual([0, 1]);
  });

  it('a cancelled battle never advances after the pause', async () => {
    await answer();
    battleSocketService.cleanup(battleId);
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS + EXPIRY_MS);
    expect(questionIndexes()).toEqual([0]);
  });

  it('the last answer completes the battle once, with no early-advance path', async () => {
    mockAllDone.mockResolvedValue(true);
    mockCompleteBattle
      .mockResolvedValueOnce({
        battle: { winner_id: 'u1' },
        leaderboard: [],
        alreadyCompleted: false,
      })
      .mockResolvedValue({
        battle: { winner_id: 'u1' },
        leaderboard: [],
        alreadyCompleted: true,
      });
    await Promise.all([answer('u1'), answer('u2')]);
    await jest.advanceTimersByTimeAsync(EARLY_ADVANCE_REVEAL_MS + EXPIRY_MS);
    expect(mockAllAnswered).not.toHaveBeenCalled();
    expect(mockApplyBattleResult).toHaveBeenCalledTimes(1);
    const completed = mockEmitToRoom.mock.calls.filter(
      (c) => c[1] === 'battle:completed'
    );
    expect(completed).toHaveLength(1);
  });
});

describe('flag off (default)', () => {
  it.each([undefined, '', 'false', '0', 'TRUE-ish'])(
    'BATTLE_EARLY_ADVANCE=%p keeps the full timer',
    async (value) => {
      if (value === undefined) delete process.env.BATTLE_EARLY_ADVANCE;
      else process.env.BATTLE_EARLY_ADVANCE = value;
      await answer('u1');
      await answer('u2');
      expect(mockAllAnswered).not.toHaveBeenCalled();
      await jest.advanceTimersByTimeAsync(EXPIRY_MS - 1);
      expect(questionIndexes()).toEqual([0]);
      await jest.advanceTimersByTimeAsync(1);
      expect(questionIndexes()).toEqual([0, 1]);
    }
  );
});
