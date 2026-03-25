import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { BattleRepository } from '@/repositories/battleRepository';
import logger from '@/utils/logger';
import { sendResponse } from '@/utils/apiResponse';
import { createAppError } from '@/utils/errorHandler';
import { BattleStatus, BattleType, Difficulty, Length } from '@prisma/client';
import battleSocketService from '@/services/battleSocket';
import socketService from '@/services/socket';

export default class BattleController {
  private readonly battleRepo: BattleRepository;

  constructor() {
    this.battleRepo = new BattleRepository();
  }

  /**
   * Get all battles with pagination, filtering, and sorting
   */
  public getBattles = catchAsync(async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      status,
      difficulty,
      type,
      length,
      topic_id,
      user_id,
      sort_by,
      sort_order,
    } = req.query;

    const result = await this.battleRepo.getBattles({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      status: status as BattleStatus,
      difficulty: difficulty as Difficulty,
      type: type as BattleType,
      length: length as Length,
      topic_id: topic_id as string,
      user_id: user_id as string,
      sort_by: sort_by as string,
      sort_order: sort_order as 'asc' | 'desc',
    });

    sendResponse(res, 'BATTLES_FETCHED', {
      data: result.data,
      meta: result.meta,
    });
  });

  /**
   * Get a single battle by ID with detailed information
   */
  public getBattle = catchAsync(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const battle = await this.battleRepo.getBattleDetails(id);
      sendResponse(res, 'BATTLE_FETCHED', { data: battle });
    } catch (error) {
      logger.error('Error fetching battle: ', error);
      throw createAppError('Battle not found', 404);
    }
  });

  /**
   * Create a new battle
   */
  public createBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const {
      title,
      description,
      topic_id,
      difficulty,
      length,
      type,
      max_participants,
      start_time,
      end_time,
      points_per_question,
      time_per_question,
      total_questions,
    } = req.body;

    // Additional validation checks if needed
    if (new Date(start_time) >= new Date(end_time)) {
      throw createAppError('End time must be after start time', 400);
    }

    // Create the battle
    const battle = await this.battleRepo.create({
      data: {
        title,
        description,
        topic_id,
        difficulty,
        length,
        type,
        max_participants: max_participants || 10,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        points_per_question: points_per_question || 10,
        time_per_question: time_per_question || 30,
        total_questions: total_questions || 10,
        user_id: req.user.id,
        status: 'UPCOMING', // Default status
      },
      include: {
        topic: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    logger.info(`Battle created: ${battle.id} by user: ${req.user.id}`);

    // Initialize battle real-time features
    battleSocketService.initializeBattle(battle.id);

    // Return the created battle
    sendResponse(res, 'BATTLE_CREATED', { data: battle });
  });

  /**
   * Update an existing battle
   */
  public updateBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const updatedBattle = await this.battleRepo.updateBattle(
      id,
      req.body,
      req.user.id
    );

    logger.info(`Battle updated: ${id} by user: ${req.user.id}`);
    sendResponse(res, 'BATTLE_UPDATED', { data: updatedBattle });
  });

  /**
   * Delete a battle or mark it as cancelled
   */
  public deleteBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { id } = req.params;
    await this.battleRepo.deleteBattle(id, req.user.id);

    logger.info(`Battle deleted/cancelled: ${id} by user: ${req.user.id}`);
    sendResponse(res, 'BATTLE_DELETED');
  });

  /**
   * Join a battle
   */
  public joinBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const result = await this.battleRepo.joinBattle(id, req.user.id);

    // Notify all participants about the new participant via WebSocket
    battleSocketService.handleParticipantJoin(id, req.user.id);

    // Join the WebSocket room for this battle
    socketService.updateBattleState(id, {
      battle_id: id,
      status: result.battle.status,
      current_participants: result.battle.current_participants,
    });

    logger.info(`User ${req.user.id} joined battle ${id}`);
    sendResponse(res, 'BATTLE_JOINED', { data: result });
  });

  /**
   * Update battle status with proper validation
   */
  public updateBattleStatus = catchAsync(
    async (req: Request, res: Response) => {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        throw createAppError('User not authenticated', 401);
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!status || !Object.values(BattleStatus).includes(status)) {
        throw createAppError('Invalid battle status', 400);
      }

      // Get current battle status
      const battle = await this.battleRepo.findUnique({
        where: { id },
        select: {
          status: true,
          user_id: true,
          current_participants: true,
          max_participants: true,
          start_time: true,
          end_time: true,
        },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if user is the creator
      if (battle.user_id !== req.user.id) {
        throw createAppError(
          'Only the battle creator can update the status',
          403
        );
      }

      // Validate status transitions
      const currentStatus = battle.status;
      const newStatus = status as BattleStatus;

      // Define valid status transitions
      const validTransitions: Record<BattleStatus, BattleStatus[]> = {
        UPCOMING: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [], // No transitions allowed from completed
        CANCELLED: [], // No transitions allowed from cancelled
        ARCHIVED: [], // No transitions allowed from archived
      };

      // Check if the transition is valid
      if (!validTransitions[currentStatus].includes(newStatus)) {
        throw createAppError(
          `Cannot transition battle from ${currentStatus} to ${newStatus}`,
          400
        );
      }

      // Additional validation for specific transitions
      if (newStatus === 'IN_PROGRESS') {
        // Check if battle has enough participants
        if (battle.current_participants < 2) {
          throw createAppError(
            'Battle needs at least 2 participants to start',
            400
          );
        }

        // Check if start time has been reached
        if (battle.start_time && new Date(battle.start_time) > new Date()) {
          throw createAppError(
            'Battle cannot start before its scheduled start time',
            400
          );
        }
      }

      // Update the battle status
      const updatedBattle = await this.battleRepo.updateBattle(
        id,
        { status: newStatus },
        req.user.id
      );

      // Handle specific status changes
      if (newStatus === 'IN_PROGRESS') {
        // Start the battle in the socket service
        await battleSocketService.startBattle(id);
      } else if (newStatus === 'COMPLETED') {
        // End the battle in the socket service
        await battleSocketService.endBattle(id);
      } else if (newStatus === 'CANCELLED') {
        // Notify participants about cancellation
        socketService.updateBattleState(id, {
          battle_id: id,
          status: 'CANCELLED',
          current_participants: battle.current_participants,
        });
      }

      logger.info(
        `Battle ${id} status updated from ${currentStatus} to ${newStatus} by user ${req.user.id}`
      );
      sendResponse(res, 'BATTLE_STATUS_UPDATED', { data: updatedBattle });
    }
  );

  /**
   * Get battle questions
   */
  public getBattleQuestions = catchAsync(
    async (req: Request, res: Response) => {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        throw createAppError('User not authenticated', 401);
      }

      const { id } = req.params;
      const questions = await this.battleRepo.getBattleQuestions(
        id,
        req.user.id
      );

      sendResponse(res, 'QUESTIONS_FETCHED', { data: questions });
    }
  );

  /**
   * Submit an answer to a battle question
   */
  public submitAnswer = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { battle_id, question_id, answer, time_taken } = req.body;

    const result = await this.battleRepo.submitAnswer(
      battle_id,
      question_id,
      req.user.id,
      answer,
      time_taken
    );

    // Update score in real-time via WebSocket
    battleSocketService.handleScoreUpdate(
      battle_id,
      req.user.id,
      result.participant.score
    );

    logger.info(
      `User ${req.user.id} submitted answer for question ${question_id} in battle ${battle_id}`
    );
    sendResponse(res, 'ANSWER_SUBMITTED', { data: result });
  });

  /**
   * Get battle leaderboard
   */
  public getBattleLeaderboard = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const { limit, page } = req.query;

      const leaderboard = await this.battleRepo.getBattleLeaderboard(
        id,
        limit ? parseInt(limit as string) : undefined,
        page ? parseInt(page as string) : undefined
      );

      sendResponse(res, 'LEADERBOARD_FETCHED', {
        data: leaderboard.data,
        meta: leaderboard.meta,
      });
    }
  );

  /**
   * Reschedule a battle
   */
  public rescheduleBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const { start_time, end_time } = req.body;

    // Convert string dates to Date objects
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);

    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw createAppError('Invalid date format', 400);
    }

    const updatedBattle = await this.battleRepo.rescheduleBattle(
      id,
      req.user.id,
      startTime,
      endTime
    );

    logger.info(`Battle ${id} rescheduled by user ${req.user.id}`);
    sendResponse(res, 'BATTLE_UPDATED', { data: updatedBattle });
  });

  /**
   * Archive a battle
   */
  public archiveBattle = catchAsync(async (req: Request, res: Response) => {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      throw createAppError('User not authenticated', 401);
    }

    const { id } = req.params;
    const archivedBattle = await this.battleRepo.archiveBattle(id, req.user.id);

    logger.info(`Battle ${id} archived by user ${req.user.id}`);
    sendResponse(res, 'BATTLE_ARCHIVED', { data: archivedBattle });
  });
}
