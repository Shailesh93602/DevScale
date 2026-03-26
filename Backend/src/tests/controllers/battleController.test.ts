import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import BattleController from '../../controllers/battleControllers';
import { BattleRepository } from '../../repositories/battleRepository';

// Make catchAsync a direct pass-through so controller methods are awaitable in tests
jest.mock('../../utils', () => ({
  catchAsync: (fn: (...args: unknown[]) => unknown) => fn,
}));

jest.mock('../../repositories/battleRepository');
jest.mock('../../services/battleSocket', () => {
  const mockFn = () => jest.fn();
  return {
    __esModule: true,
    default: {
      initializeBattle: mockFn(),
      handleParticipantJoined: mockFn(),
      handleParticipantLeft: mockFn(),
      handleParticipantReady: mockFn(),
      startBattle: mockFn(),
      cleanup: mockFn(),
      notifyStatusChanged: mockFn(),
      handleAnswerSubmitted: mockFn(),
    },
  };
});

describe('BattleController', () => {
  let battleController: BattleController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: { id: 'test-user-id', username: 'testuser' } as Request['user'],
    };

    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn() as unknown as Response['json'],
    };

    mockNext = jest.fn() as jest.Mock;
    battleController = new BattleController();
  });

  describe('createBattle', () => {
    it('creates a battle and returns 201', async () => {
      const battleData = {
        title: 'Test Battle',
        topic_id: 'topic-uuid',
        difficulty: 'EASY',
        type: 'QUICK',
        max_participants: 4,
        total_questions: 5,
        time_per_question: 30,
        points_per_question: 100,
      };
      mockRequest.body = battleData;

      const createdBattle = { id: 'battle-id', ...battleData, status: 'WAITING' };
      (BattleRepository.prototype.createBattle as unknown as jest.Mock).mockResolvedValue(createdBattle as never);

      await battleController.createBattle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(BattleRepository.prototype.createBattle).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: createdBattle })
      );
    });

    it('passes 401 to next() when unauthenticated', async () => {
      mockRequest.user = undefined;

      try {
        await battleController.createBattle(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );
      } catch (err) {
        mockNext(err);
      }

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });

  describe('getBattles', () => {
    it('returns battles list with 200', async () => {
      const mockBattles = {
        data: [{ id: '1', title: 'Battle 1', status: 'WAITING' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      (BattleRepository.prototype.getBattles as unknown as jest.Mock).mockResolvedValue(mockBattles as never);

      await battleController.getBattles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(BattleRepository.prototype.getBattles).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: mockBattles.data })
      );
    });
  });

  describe('getBattle', () => {
    it('returns a single battle with 200', async () => {
      mockRequest.params = { id: 'battle-id' };
      const mockBattle = { id: 'battle-id', title: 'Battle 1', status: 'WAITING' };
      (BattleRepository.prototype.getBattleDetails as unknown as jest.Mock).mockResolvedValue(mockBattle as never);

      await battleController.getBattle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(BattleRepository.prototype.getBattleDetails).toHaveBeenCalledWith('battle-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('cancelBattle', () => {
    it('cancels a battle and returns 200', async () => {
      mockRequest.params = { id: 'battle-id' };
      (BattleRepository.prototype.cancelBattle as unknown as jest.Mock).mockResolvedValue(
        { id: 'battle-id', status: 'CANCELLED' } as never
      );

      await battleController.cancelBattle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(BattleRepository.prototype.cancelBattle).toHaveBeenCalledWith('battle-id', 'test-user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('passes 401 to next() when unauthenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'battle-id' };

      try {
        await battleController.cancelBattle(
          mockRequest as Request,
          mockResponse as Response,
          mockNext as NextFunction
        );
      } catch (err) {
        mockNext(err);
      }

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });
  });
});
