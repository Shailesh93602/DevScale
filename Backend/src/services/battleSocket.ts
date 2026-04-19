import socketService from './socket';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import { BattleRepository } from '../repositories/battleRepository';

const battleRepo = new BattleRepository();

// ─── Types ─────────────────────────────────────────────────────────────────

interface BattleState {
  currentQuestionIndex: number;
  questionStartedAt: number;
  questionEndsAt: number;
  questionTimerInterval: NodeJS.Timeout | null;
  questionTimeoutHandle: NodeJS.Timeout | null;
  lobbyCountdownHandle: ReturnType<typeof setInterval> | null;
  startScheduleHandle: NodeJS.Timeout | null;
}

// ─── Service ────────────────────────────────────────────────────────────────

class BattleSocketService {
  private states = new Map<string, BattleState>();

  // ── Init (called after battle creation) ───────────────────────────────

  async initializeBattle(battleId: string) {
    try {
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
      });
      if (!battle) return;

      if (battle.type === 'SCHEDULED' && battle.start_time) {
        const lobbyOpenAt = battle.start_time.getTime() - 60_000;
        const delay = lobbyOpenAt - Date.now();
        if (delay > 0) {
          const handle = setTimeout(
            () => this.transitionToLobby(battleId),
            delay
          );
          this.getOrCreateState(battleId).startScheduleHandle = handle;
          logger.info(
            `Battle ${battleId}: lobby opens in ${Math.round(delay / 1000)}s`
          );
        } else if (delay > -60_000) {
          // Already within lobby window
          await this.transitionToLobby(battleId);
        }
      }
    } catch (err) {
      logger.error(`initializeBattle ${battleId}:`, err);
    }
  }

  // ── Lobby ──────────────────────────────────────────────────────────────

  async transitionToLobby(battleId: string) {
    try {
      const battle = await prisma.battle.update({
        where: { id: battleId },
        data: { status: 'LOBBY' },
      });

      socketService.emitToRoom(battleId, 'battle:status_changed', {
        status: 'LOBBY',
      });
      logger.info(`Battle ${battleId} → LOBBY`);

      if (battle.type === 'SCHEDULED' && battle.start_time) {
        this.runLobbyCountdown(battleId, battle.start_time.getTime());
      }
    } catch (err) {
      logger.error(`transitionToLobby ${battleId}:`, err);
    }
  }

  private runLobbyCountdown(battleId: string, startAtMs: number) {
    const state = this.getOrCreateState(battleId);
    if (state.lobbyCountdownHandle) clearInterval(state.lobbyCountdownHandle);

    const tick = setInterval(async () => {
      const secondsRemaining = Math.ceil((startAtMs - Date.now()) / 1000);
      if (secondsRemaining <= 0) {
        clearInterval(tick);
        state.lobbyCountdownHandle = null;
        await this.startBattle(battleId);
        return;
      }
      socketService.emitToRoom(battleId, 'battle:countdown', {
        seconds_remaining: secondsRemaining,
      });
    }, 1000);

    state.lobbyCountdownHandle = tick;
  }

  // ── Start ──────────────────────────────────────────────────────────────

  async startBattle(battleId: string) {
    try {
      const state = this.getOrCreateState(battleId);
      if (state.lobbyCountdownHandle) {
        clearInterval(state.lobbyCountdownHandle);
        state.lobbyCountdownHandle = null;
      }

      await prisma.battle.update({
        where: { id: battleId },
        data: { status: 'IN_PROGRESS' },
      });
      await prisma.battleParticipant.updateMany({
        where: { battle_id: battleId, status: { in: ['JOINED', 'READY'] } },
        data: { status: 'PLAYING' },
      });

      socketService.emitToRoom(battleId, 'battle:started', {
        started_at: Date.now(),
      });
      logger.info(`Battle ${battleId} → IN_PROGRESS`);

      setTimeout(() => this.broadcastQuestion(battleId, 0), 2000);
    } catch (err) {
      logger.error(`startBattle ${battleId}:`, err);
    }
  }

  // ── Questions ──────────────────────────────────────────────────────────

  async broadcastQuestion(battleId: string, index: number) {
    try {
      const state = this.getOrCreateState(battleId);
      if (state.questionTimerInterval)
        clearInterval(state.questionTimerInterval);
      if (state.questionTimeoutHandle)
        clearTimeout(state.questionTimeoutHandle);
      state.questionTimerInterval = null;
      state.questionTimeoutHandle = null;

      const questions = await prisma.battleQuestion.findMany({
        where: { battle_id: battleId },
        orderBy: { order: 'asc' },
      });

      if (index >= questions.length) {
        await this.endBattle(battleId);
        return;
      }

      const question = questions[index];
      const now = Date.now();
      const endsAt = now + question.time_limit * 1000;

      state.currentQuestionIndex = index;
      state.questionStartedAt = now;
      state.questionEndsAt = endsAt;

      socketService.emitToRoom(battleId, 'battle:question', {
        index,
        total_questions: questions.length,
        question_id: question.id,
        time_limit: question.time_limit,
        ends_at: endsAt,
      });

      // Per-second timer ticks
      const timerInterval = setInterval(() => {
        const secondsRemaining = Math.ceil((endsAt - Date.now()) / 1000);
        if (secondsRemaining > 0) {
          socketService.emitToRoom(battleId, 'battle:timer_tick', {
            seconds_remaining: secondsRemaining,
          });
        }
      }, 1000);

      // Auto-advance when time expires
      const timeoutHandle = setTimeout(
        async () => {
          clearInterval(timerInterval);
          state.questionTimerInterval = null;
          state.questionTimeoutHandle = null;
          logger.info(`Battle ${battleId} Q${index} expired → advancing`);
          const done = await battleRepo.checkAllParticipantsDone(battleId);
          if (done) {
            await this.endBattle(battleId);
          } else {
            await this.broadcastQuestion(battleId, index + 1);
          }
        },
        question.time_limit * 1000 + 500
      );

      state.questionTimerInterval = timerInterval;
      state.questionTimeoutHandle = timeoutHandle;

      logger.info(`Battle ${battleId} Q${index + 1}/${questions.length}`);
    } catch (err) {
      logger.error(`broadcastQuestion ${battleId} index ${index}:`, err);
    }
  }

  // ── Answer submitted ────────────────────────────────────────────────────

  async handleAnswerSubmitted(
    battleId: string,
    userId: string,
    result: {
      is_correct: boolean;
      points_earned: number;
      correct_answer: number;
      explanation?: string | null;
      leaderboard: unknown[];
      participant_done: boolean;
    }
  ) {
    // Private result only to the submitting user
    socketService.emitToUser(battleId, userId, 'battle:answer_result', {
      is_correct: result.is_correct,
      points_earned: result.points_earned,
      correct_answer: result.correct_answer,
      explanation: result.explanation ?? null,
    });

    // Updated leaderboard to everyone in the room
    socketService.emitToRoom(battleId, 'battle:score_update', {
      leaderboard: result.leaderboard,
    });

    // If everyone's done, end battle
    if (await battleRepo.checkAllParticipantsDone(battleId)) {
      const state = this.states.get(battleId);
      if (state?.questionTimeoutHandle) {
        clearTimeout(state.questionTimeoutHandle);
        state.questionTimeoutHandle = null;
      }
      if (state?.questionTimerInterval) {
        clearInterval(state.questionTimerInterval);
        state.questionTimerInterval = null;
      }
      await this.endBattle(battleId);
    }
  }

  // ── End battle ─────────────────────────────────────────────────────────

  async endBattle(battleId: string) {
    try {
      const { battle, leaderboard } = await battleRepo.completeBattle(battleId);
      socketService.emitToRoom(battleId, 'battle:completed', {
        winner_id: battle.winner_id,
        leaderboard,
      });
      this.cleanup(battleId);
      logger.info(
        `Battle ${battleId} → COMPLETED. Winner: ${battle.winner_id}`
      );
    } catch (err) {
      logger.error(`endBattle ${battleId}:`, err);
    }
  }

  // ── Participant events ─────────────────────────────────────────────────

  async handleParticipantJoined(
    battleId: string,
    user: { id: string; username: string; avatar_url?: string | null }
  ) {
    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    socketService.emitToRoom(battleId, 'battle:participant_joined', {
      user,
      total_count: battle?.current_participants ?? 0,
    });
  }

  async handleParticipantReady(battleId: string, userId: string) {
    const [readyCount, totalCount] = await Promise.all([
      prisma.battleParticipant.count({
        where: { battle_id: battleId, status: 'READY' },
      }),
      prisma.battleParticipant.count({ where: { battle_id: battleId } }),
    ]);
    socketService.emitToRoom(battleId, 'battle:participant_ready', {
      user_id: userId,
      ready_count: readyCount,
      total_count: totalCount,
    });
  }

  async handleParticipantLeft(battleId: string, userId: string) {
    const battle = await prisma.battle.findUnique({ where: { id: battleId } });
    socketService.emitToRoom(battleId, 'battle:participant_left', {
      user_id: userId,
      total_count: battle?.current_participants ?? 0,
    });
  }

  // ── Reconnect ──────────────────────────────────────────────────────────

  async sendStateToSocket(socketId: string, battleId: string) {
    try {
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
        include: {
          participants: {
            include: {
              user: { select: { id: true, username: true, avatar_url: true } },
            },
          },
        },
      });
      if (!battle) return;

      const leaderboard = await battleRepo.getBattleLeaderboard(battleId);
      const state = this.states.get(battleId);

      socketService.emitToSocket(socketId, 'battle:state', {
        status: battle.status,
        current_question_index: state?.currentQuestionIndex ?? -1,
        question_ends_at: state?.questionEndsAt ?? null,
        leaderboard,
        participants: battle.participants.map((p) => ({
          user_id: p.user_id,
          username: p.user.username,
          avatar_url: p.user.avatar_url,
          status: p.status,
          score: p.score,
          rank: p.rank,
        })),
      });
    } catch (err) {
      logger.error(`sendStateToSocket ${battleId}:`, err);
    }
  }

  // ── Utils ───────────────────────────────────────────────────────────────

  private getOrCreateState(battleId: string): BattleState {
    if (!this.states.has(battleId)) {
      this.states.set(battleId, {
        currentQuestionIndex: -1,
        questionStartedAt: 0,
        questionEndsAt: 0,
        questionTimerInterval: null,
        questionTimeoutHandle: null,
        lobbyCountdownHandle: null,
        startScheduleHandle: null,
      });
    }
    return this.states.get(battleId)!;
  }

  notifyStatusChanged(battleId: string, status: string) {
    socketService.emitToRoom(battleId, 'battle:status_changed', { status });
  }

  cleanup(battleId: string) {
    const state = this.states.get(battleId);
    if (!state) return;
    if (state.questionTimerInterval) clearInterval(state.questionTimerInterval);
    if (state.questionTimeoutHandle) clearTimeout(state.questionTimeoutHandle);
    if (state.lobbyCountdownHandle) clearInterval(state.lobbyCountdownHandle);
    if (state.startScheduleHandle) clearTimeout(state.startScheduleHandle);
    this.states.delete(battleId);
    logger.info(`Battle ${battleId} state cleaned up`);
  }
}

export const battleSocketService = new BattleSocketService();
export default battleSocketService;
