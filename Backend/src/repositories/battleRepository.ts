import { Battle } from '@prisma/client';
import { BattleStatus } from '../constants/enums';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import type {
  BattleDetail,
  BattleListMeta,
  BattleListParams,
  BattleSummary,
} from './battle/battleShapes.js';
import {
  getBattleDetails,
  getBattles,
  getGlobalStats,
  invalidateBattleListCache,
} from './battle/browse.js';
import {
  addQuestions,
  addQuestionsFromPool,
  createBattle,
  getBattleQuestions,
} from './battle/questions.js';
import {
  autoReadyMatchedBattle,
  cancelBattle,
  joinBattle,
  leaveBattle,
  markReady,
  startBattle,
  updateStatus,
} from './battle/lifecycle.js';
import {
  allActivePlayersAnswered,
  checkAllParticipantsDone,
  completeBattle,
  submitAnswer,
} from './battle/gameplay.js';
import {
  getBattleLeaderboard,
  getBattleResults,
  getMyBattles,
  getMyResults,
  getUserAnswers,
} from './battle/results.js';
import { getUserStats } from './battle/userStats.js';

export { calculatePoints } from './battle/scoring.js';
export type {
  BattleDetail,
  BattleListParams,
  BattleSummary,
} from './battle/battleShapes.js';

/** Stable public surface; each concern lives in its own module under `./battle/`. */
export class BattleRepository extends BaseRepository<
  Battle,
  typeof prisma.battle
> {
  constructor() {
    super(prisma.battle);
  }

  // ── Browse & detail ──────────────────────────────────────────────────────

  getGlobalStats(): Promise<{
    activeBattles: number;
    upcomingBattles: number;
    totalParticipants: number;
  }> {
    return getGlobalStats();
  }

  getBattles(
    params: BattleListParams
  ): Promise<{ data: BattleSummary[]; meta: BattleListMeta }> {
    return getBattles(params);
  }

  /** Invalidate battle list and global-stats caches (call after create/join/cancel). */
  invalidateBattleListCache(): void {
    invalidateBattleListCache();
  }

  getBattleDetails(idOrSlug: string): Promise<BattleDetail> {
    return getBattleDetails(idOrSlug);
  }

  // ── Creation & questions ─────────────────────────────────────────────────

  createBattle(
    data: Parameters<typeof createBattle>[0]
  ): Promise<BattleDetail & { slug: string }> {
    return createBattle(data);
  }

  addQuestionsFromPool(
    ...args: Parameters<typeof addQuestionsFromPool>
  ): ReturnType<typeof addQuestionsFromPool> {
    return addQuestionsFromPool(...args);
  }

  getBattleQuestions(battleIdOrSlug: string, userId: string) {
    return getBattleQuestions(battleIdOrSlug, userId);
  }

  addQuestions(
    ...args: Parameters<typeof addQuestions>
  ): ReturnType<typeof addQuestions> {
    return addQuestions(...args);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  joinBattle(battleIdOrSlug: string, userId: string) {
    return joinBattle(battleIdOrSlug, userId);
  }

  leaveBattle(battleIdOrSlug: string, userId: string) {
    return leaveBattle(battleIdOrSlug, userId);
  }

  markReady(battleIdOrSlug: string, userId: string) {
    return markReady(battleIdOrSlug, userId);
  }

  startBattle(battleIdOrSlug: string, userId: string) {
    return startBattle(battleIdOrSlug, userId);
  }

  cancelBattle(battleIdOrSlug: string, userId: string) {
    return cancelBattle(battleIdOrSlug, userId);
  }

  autoReadyMatchedBattle(battleId: string): Promise<boolean> {
    return autoReadyMatchedBattle(battleId);
  }

  updateStatus(
    battleIdOrSlug: string,
    userId: string,
    newStatus: BattleStatus
  ) {
    return updateStatus(battleIdOrSlug, userId, newStatus);
  }

  // ── Gameplay ─────────────────────────────────────────────────────────────

  submitAnswer(
    battleId: string,
    questionId: string,
    userId: string,
    selectedOption: number,
    timeTakenMs: number
  ) {
    return submitAnswer(
      battleId,
      questionId,
      userId,
      selectedOption,
      timeTakenMs
    );
  }

  checkAllParticipantsDone(battleId: string): Promise<boolean> {
    return checkAllParticipantsDone(battleId);
  }

  allActivePlayersAnswered(
    battleId: string,
    questionId: string
  ): Promise<boolean> {
    return allActivePlayersAnswered(battleId, questionId);
  }

  completeBattle(battleId: string) {
    return completeBattle(battleId);
  }

  // ── Results & stats ──────────────────────────────────────────────────────

  getBattleLeaderboard(battleIdOrSlug: string) {
    return getBattleLeaderboard(battleIdOrSlug);
  }

  getBattleResults(battleIdOrSlug: string) {
    return getBattleResults(battleIdOrSlug);
  }

  getUserAnswers(battleId: string, userId: string) {
    return getUserAnswers(battleId, userId);
  }

  getMyResults(battleIdOrSlug: string, userId: string) {
    return getMyResults(battleIdOrSlug, userId);
  }

  getMyBattles(userId: string, page = 1, limit = 10) {
    return getMyBattles(userId, page, limit);
  }

  getUserStats(userId: string, timeframe?: string) {
    return getUserStats(userId, timeframe);
  }
}
