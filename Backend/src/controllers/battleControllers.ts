import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { BattleRepository } from '../repositories/battleRepository';
import logger from '../utils/logger';
import { sendResponse } from '../utils/apiResponse';
import { createAppError } from '../utils/errorHandler';
import { BattleType, Difficulty } from '@prisma/client';
import battleSocketService from '../services/battleSocket';
import {
  getQuestionPool,
  getAntiRepeatExclusions,
  QuestionSourceType,
} from '../services/questionPoolService';

export default class BattleController {
  private readonly repo: BattleRepository;

  constructor() {
    this.repo = new BattleRepository();
  }

  // ── Browse ──────────────────────────────────────────────────────────────

  /**
   * GET /battles/global-stats
   * Returns aggregate counts for the Battle Zone header bar.
   * Single SQL query, 30s cached — replaces the old ?limit=100 hack.
   */
  getGlobalStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await this.repo.getGlobalStats();
    sendResponse(res, 'BATTLE_GLOBAL_STATS_FETCHED', { data: stats });
  });

  getBattles = catchAsync(async (req: Request, res: Response) => {
    const {
      page,
      limit,
      search,
      status,
      difficulty,
      type,
      topic_id,
      user_id,
      sort_by,
      sort_order,
    } = req.query;

    const result = await this.repo.getBattles({
      page: page ? Number.parseInt(page as string) : undefined,
      limit: limit ? Number.parseInt(limit as string) : undefined,
      search: search as string | undefined,
      status: status as Parameters<typeof this.repo.getBattles>[0]['status'],
      difficulty: difficulty as Difficulty | undefined,
      type: type as BattleType | undefined,
      topic_id: topic_id as string | undefined,
      user_id: user_id as string | undefined,
      sort_by: sort_by as string | undefined,
      sort_order: sort_order as 'asc' | 'desc' | undefined,
    });

    sendResponse(res, 'BATTLES_FETCHED', {
      data: result.data,
      meta: result.meta,
    });
  });

  // ── Detail ──────────────────────────────────────────────────────────────

  getBattle = catchAsync(async (req: Request, res: Response) => {
    const battle = await this.repo.getBattleDetails(req.params.id);
    sendResponse(res, 'BATTLE_FETCHED', { data: battle });
  });

  // ── Question Pool (preview, no correct answers) ─────────────────────────

  getQuestionPool = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { type, id, difficulty, categories, count } = req.query;

    const parsedCategories = categories
      ? (categories as string)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : undefined;

    const result = await getQuestionPool({
      type: type as QuestionSourceType,
      id: id as string,
      difficulty: difficulty as string | undefined,
      categories: parsedCategories,
      count: count ? Number.parseInt(count as string) : undefined,
    });

    const responseType =
      result.total_available === 0
        ? 'QUESTION_POOL_EMPTY'
        : 'QUESTION_POOL_FETCHED';

    // Strip correct_answer before sending as preview
    const preview = result.questions.map((question) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correct_answer, ...questionsWithoutAnswer } = question;
      return questionsWithoutAnswer;
    });

    sendResponse(res, responseType, {
      data: { questions: preview, total_available: result.total_available },
    });
  });

  // ── Create ──────────────────────────────────────────────────────────────

  createBattle = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const {
      title,
      description,
      topic_id,
      question_source,
      difficulty,
      type,
      max_participants,
      total_questions,
      time_per_question,
      points_per_question,
      start_time,
    } = req.body;

    const resolvedTotalQuestions = total_questions ?? 10;

    // If question_source provided, fetch pool now so we can seed atomically
    let autoQuestions:
      | Awaited<ReturnType<typeof getQuestionPool>>['questions']
      | undefined;
    if (question_source) {
      const excludeIds = await getAntiRepeatExclusions(
        question_source.type as QuestionSourceType,
        question_source.id
      );
      const pool = await getQuestionPool({
        type: question_source.type as QuestionSourceType,
        id: question_source.id,
        difficulty: question_source.difficulty ?? difficulty,
        categories: question_source.categories,
        count: question_source.count ?? resolvedTotalQuestions,
        exclude_question_ids: excludeIds,
      });
      if (pool.questions.length === 0) {
        throw createAppError(
          'No questions available for the selected source. Try a broader selection.',
          422
        );
      }
      autoQuestions = pool.questions;
    }

    const battle = await this.repo.createBattle({
      title,
      description,
      topic_id: topic_id ?? null,
      difficulty,
      type,
      max_participants: max_participants ?? 6,
      total_questions: autoQuestions
        ? Math.min(autoQuestions.length, resolvedTotalQuestions)
        : resolvedTotalQuestions,
      time_per_question: time_per_question ?? 30,
      points_per_question: points_per_question ?? 100,
      start_time: start_time ? new Date(start_time) : undefined,
      user_id: req.user.id,
      question_source_type: question_source?.type ?? null,
      question_source_id: question_source?.id ?? null,
    });

    // Auto-seed questions if source was provided
    if (autoQuestions && autoQuestions.length > 0) {
      const questionsToAdd = autoQuestions.slice(0, battle.total_questions);
      await this.repo.addQuestionsFromPool(battle.id, questionsToAdd);
      logger.info(
        `Auto-seeded ${questionsToAdd.length} questions into battle ${battle.id}`
      );
    }

    battleSocketService.initializeBattle(battle.id);

    logger.info(`Battle created: ${battle.id} by user ${req.user.id}`);
    sendResponse(res, 'BATTLE_CREATED', { data: battle });
  });

  // ── Join ────────────────────────────────────────────────────────────────

  joinBattle = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    const result = await this.repo.joinBattle(id, req.user.id);

    await battleSocketService.handleParticipantJoined(id, {
      id: req.user.id,
      username: req.user.username || 'Unknown',
      avatar_url: req.user.avatar_url,
    });

    logger.info(`User ${req.user.id} joined battle ${id}`);
    sendResponse(res, 'BATTLE_JOINED', { data: result });
  });

  // ── Leave ────────────────────────────────────────────────────────────────

  leaveBattle = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    await this.repo.leaveBattle(id, req.user.id);

    await battleSocketService.handleParticipantLeft(id, req.user.id);

    logger.info(`User ${req.user.id} left battle ${id}`);
    sendResponse(res, 'BATTLE_LEFT');
  });

  // ── Ready ────────────────────────────────────────────────────────────────

  markReady = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    const participant = await this.repo.markReady(id, req.user.id);

    await battleSocketService.handleParticipantReady(id, req.user.id);

    logger.info(`User ${req.user.id} ready in battle ${id}`);
    sendResponse(res, 'BATTLE_READY', { data: participant });
  });

  // ── Open Lobby (creator manually opens lobby for QUICK/PRACTICE battles) ─

  openLobby = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    await this.repo.updateStatus(id, req.user.id, 'LOBBY');

    battleSocketService.notifyStatusChanged(id, 'LOBBY');
    logger.info(`Battle ${id} moved to LOBBY by creator ${req.user.id}`);
    sendResponse(res, 'BATTLE_STATUS_UPDATED');
  });

  // ── Start (creator manually starts) ────────────────────────────────────

  startBattle = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    await this.repo.startBattle(id, req.user.id);

    // Delegate to socket service which handles IN_PROGRESS transition + question broadcasting
    await battleSocketService.startBattle(id);

    logger.info(`Battle ${id} started by creator ${req.user.id}`);
    sendResponse(res, 'BATTLE_STARTED');
  });

  // ── Cancel ────────────────────────────────────────────────────────────────

  cancelBattle = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    await this.repo.cancelBattle(id, req.user.id);

    battleSocketService.cleanup(id);
    battleSocketService.notifyStatusChanged(id, 'CANCELLED');

    logger.info(`Battle ${id} cancelled by ${req.user.id}`);
    sendResponse(res, 'BATTLE_CANCELLED');
  });

  // ── Add questions (creator only) ──────────────────────────────────────────

  addBattleQuestions = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { id } = req.params;
    const { questions } = req.body;

    const result = await this.repo.addQuestions(id, req.user.id, questions);

    logger.info(
      `${questions.length} questions added to battle ${id} by ${req.user.id}`
    );
    sendResponse(res, 'BATTLE_QUESTIONS_ADDED', { data: result });
  });

  // ── Questions ────────────────────────────────────────────────────────────

  getBattleQuestions = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const questions = await this.repo.getBattleQuestions(
      req.params.id,
      req.user.id
    );
    sendResponse(res, 'QUESTIONS_FETCHED', { data: questions });
  });

  // ── Submit answer ─────────────────────────────────────────────────────────

  submitAnswer = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { battle_id, question_id, selected_option, time_taken_ms } = req.body;

    const result = await this.repo.submitAnswer(
      battle_id,
      question_id,
      req.user.id,
      Number(selected_option),
      Number(time_taken_ms)
    );

    // Fire socket events (answer result, leaderboard, possible completion)
    await battleSocketService.handleAnswerSubmitted(
      battle_id,
      req.user.id,
      result
    );

    logger.info(
      `User ${req.user.id} answered Q ${question_id} in battle ${battle_id}`
    );
    sendResponse(res, 'ANSWER_SUBMITTED', {
      data: {
        is_correct: result.is_correct,
        points_earned: result.points_earned,
        correct_answer: result.correct_answer,
        explanation: result.explanation,
        leaderboard: result.leaderboard,
        participant_done: result.participant_done,
      },
    });
  });

  // ── Leaderboard ────────────────────────────────────────────────────────────

  getBattleLeaderboard = catchAsync(async (req: Request, res: Response) => {
    const leaderboard = await this.repo.getBattleLeaderboard(req.params.id);
    sendResponse(res, 'LEADERBOARD_FETCHED', { data: leaderboard });
  });

  // ── Results ────────────────────────────────────────────────────────────────

  getBattleResults = catchAsync(async (req: Request, res: Response) => {
    const results = await this.repo.getBattleResults(req.params.id);
    sendResponse(res, 'BATTLE_RESULTS_FETCHED', { data: results });
  });

  getMyResults = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);
    const results = await this.repo.getMyResults(req.params.id, req.user.id);
    sendResponse(res, 'BATTLE_MY_RESULTS_FETCHED', { data: results });
  });

  // ── My battles ────────────────────────────────────────────────────────────

  getMyBattles = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);

    const { page, limit } = req.query;
    const result = await this.repo.getMyBattles(
      req.user.id,
      page ? Number.parseInt(page as string) : 1,
      limit ? Number.parseInt(limit as string) : 10
    );
    sendResponse(res, 'BATTLES_FETCHED', {
      data: result.data,
      meta: result.meta,
    });
  });

  // ── Statistics ────────────────────────────────────────────────────────────

  getStatistics = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw createAppError('Unauthorized', 401);
    const timeframe = req.query.timeframe as string | undefined;
    const stats = await this.repo.getUserStats(req.user.id, timeframe);
    sendResponse(res, 'STATISTICS_FETCHED', { data: stats });
  });
}
