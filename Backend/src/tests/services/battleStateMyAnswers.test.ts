// A reloaded battle page re-offered questions the player had already answered:
// the state replay carried nothing about the player's own answers.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockEmitToSocket = jest.fn();
const mockFindBattle = jest.fn<(...a: unknown[]) => Promise<unknown>>();
const mockFindAnswers = jest.fn<(...a: unknown[]) => Promise<unknown>>();

jest.mock('../../services/socket', () => ({
  __esModule: true,
  default: { emitToSocket: (...a: unknown[]) => mockEmitToSocket(...a) },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    battle: { findUnique: (...a: unknown[]) => mockFindBattle(...a) },
    battleAnswer: { findMany: (...a: unknown[]) => mockFindAnswers(...a) },
  },
}));
jest.mock('../../repositories/battleRepository', () => ({
  BattleRepository: jest.fn().mockImplementation(() => ({
    getBattleLeaderboard: async () => [],
  })),
}));
jest.mock('../../services/rating/battleRatingService', () => ({
  BattleRatingService: jest.fn().mockImplementation(() => ({})),
}));

import battleSocketService from '../../services/battleSocket';

beforeEach(() => {
  jest.clearAllMocks();
  mockFindBattle.mockResolvedValue({
    status: 'IN_PROGRESS',
    participants: [],
  });
  mockFindAnswers.mockResolvedValue([
    {
      question_id: 'q1',
      selected_option: 2,
      is_correct: true,
      points_earned: 140,
      question: { correct_answer: 2, explanation: null },
    },
  ]);
});

const statePayload = () =>
  mockEmitToSocket.mock.calls[0]?.[2] as { my_answers: unknown[] };

describe('battle:state replays the joining player’s own answers', () => {
  it('includes each recorded answer with its verdict', async () => {
    await battleSocketService.sendStateToSocket('sock', 'b1', 'u1');

    expect(mockFindAnswers).toHaveBeenCalledWith(
      expect.objectContaining({ where: { battle_id: 'b1', user_id: 'u1' } })
    );
    expect(mockEmitToSocket.mock.calls[0][1]).toBe('battle:state');
    expect(statePayload().my_answers).toEqual([
      {
        question_id: 'q1',
        selected_option: 2,
        is_correct: true,
        points_earned: 140,
        correct_answer: 2,
        explanation: null,
      },
    ]);
  });

  it('sends no answers when it does not know who the socket is', async () => {
    await battleSocketService.sendStateToSocket('sock', 'b1');
    expect(mockFindAnswers).not.toHaveBeenCalled();
    expect(statePayload().my_answers).toEqual([]);
  });
});
