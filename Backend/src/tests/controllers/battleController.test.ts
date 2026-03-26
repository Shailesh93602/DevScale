import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import BattleController from '../../controllers/battleControllers';
import { BattleRepository } from '../../repositories/battleRepository';

// Mock BattleRepository
jest.mock('../../repositories/battleRepository');
// Mock battleSocketService
jest.mock('../../services/battleSocket', () => ({
  initializeBattle: jest.fn(),
}));

describe('BattleController', () => {
  let battleController: BattleController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mocks
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: { id: 'test-user-id' } as Request['user'],
    };

    mockResponse = {
      status: jest.fn().mockReturnThis() as unknown as Response['status'],
      json: jest.fn() as unknown as Response['json'],
    } as Partial<Response>;

    mockNext = jest.fn();

    // Instantiate controller
    battleController = new BattleController();
  });

  describe('createBattle', () => {
    it('should create a battle successfully', async () => {
      // Mock data
      const battleData = {
        title: 'Test Battle',
        description: 'Test Description',
        start_time: new Date(Date.now() + 3600000).toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString(),
      };

      mockRequest.body = battleData;

      const createdBattle = {
        id: 'battle-id',
        ...battleData,
        status: 'UPCOMING',
      };

      // Mock Repository method
      (
        BattleRepository.prototype.create as unknown as jest.Mock
      ).mockResolvedValue(createdBattle as unknown as never);

      // Call controller method
      await battleController.createBattle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assertions
      expect(BattleRepository.prototype.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: createdBattle,
        })
      );
    });

    it('should fail if end time is before start time', async () => {
      const battleData = {
        title: 'Test Battle',
        start_time: new Date(Date.now() + 7200000).toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
      };
      mockRequest.body = battleData;

      await battleController.createBattle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Expect error to be passed to next()
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'End time must be after start time',
          statusCode: 400,
        })
      );
    });
  });

  describe('getBattles', () => {
    it('should get battles successfully', async () => {
      const mockBattles = {
        data: [{ id: '1', title: 'Battle 1' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      (
        BattleRepository.prototype.getBattles as unknown as jest.Mock
      ).mockResolvedValue(mockBattles as unknown as never);

      await battleController.getBattles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(BattleRepository.prototype.getBattles).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockBattles.data,
        })
      );
    });
  });
});
