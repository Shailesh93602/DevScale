import socketService, { ScoreUpdate } from './socket';
import logger from '@/utils/logger';
import prisma from '@/lib/prisma';
import { BattleStatus } from '@prisma/client';

class BattleSocketService {
  // Map to track active battle timers
  private readonly battleTimers: Map<string, NodeJS.Timeout> = new Map();

  // Map to track battle question timers
  private readonly questionTimers: Map<string, NodeJS.Timeout> = new Map();

  // Map to track battle state
  private readonly battleStates: Map<
    string,
    {
      status: BattleStatus;
      currentQuestionIndex: number;
      startTime: number;
      endTime: number;
    }
  > = new Map();

  /**
   * Initialize a battle's real-time features
   */
  async initializeBattle(battleId: string) {
    try {
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!battle) {
        logger.error(`Cannot initialize battle ${battleId}: Battle not found`);
        return;
      }

      // Schedule battle start if it's in the future
      const now = Date.now();
      const scheduledStartTime = battle.start_time?.getTime();

      if (
        scheduledStartTime &&
        scheduledStartTime > now &&
        battle.status === 'UPCOMING'
      ) {
        const delay = scheduledStartTime - now;

        // Schedule battle to start automatically
        const timer = setTimeout(() => {
          this.startBattle(battleId);
        }, delay);

        this.battleTimers.set(battleId, timer);

        logger.info(`Battle ${battleId} scheduled to start in ${delay}ms`);
      }
    } catch (error) {
      logger.error(`Error initializing battle ${battleId}:`, error);
    }
  }

  /**
   * Start a battle
   */
  async startBattle(battleId: string) {
    try {
      // Update battle status in database
      const battle = await prisma.battle.update({
        where: { id: battleId },
        data: { status: 'IN_PROGRESS' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      // Clear any existing timer
      if (this.battleTimers.has(battleId)) {
        clearTimeout(this.battleTimers.get(battleId));
        this.battleTimers.delete(battleId);
      }

      // Update battle state
      const battleState = this.battleStates.get(battleId);
      if (battleState) {
        battleState.status = 'IN_PROGRESS';
      } else {
        this.battleStates.set(battleId, {
          status: 'IN_PROGRESS',
          currentQuestionIndex: -1,
          startTime: battle.start_time?.getTime() || 0,
          endTime: battle.end_time?.getTime() || 0,
        });
      }

      // Notify all participants
      socketService.updateBattleState(battleId, {
        battle_id: battleId,
        status: 'IN_PROGRESS',
        current_participants: battle.current_participants,
      });

      // Start the first question after a short delay
      setTimeout(() => {
        this.moveToNextQuestion(battleId);
      }, 3000);

      logger.info(`Battle ${battleId} started`);
    } catch (error) {
      logger.error(`Error starting battle ${battleId}:`, error);
    }
  }

  /**
   * Move to the next question in the battle
   */
  async moveToNextQuestion(battleId: string) {
    try {
      const battleState = this.battleStates.get(battleId);
      if (!battleState) {
        logger.error(
          `Cannot move to next question: Battle ${battleId} state not found`
        );
        return;
      }

      // Get battle with questions
      const battle = await prisma.battle.findUnique({
        where: { id: battleId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!battle || battle.questions.length === 0) {
        logger.error(
          `Cannot move to next question: Battle ${battleId} or questions not found`
        );
        return;
      }

      // Clear any existing question timer
      if (this.questionTimers.has(battleId)) {
        clearTimeout(this.questionTimers.get(battleId));
        this.questionTimers.delete(battleId);
      }

      // Increment question index
      const nextQuestionIndex = battleState.currentQuestionIndex + 1;

      // Check if we've reached the end of questions
      if (nextQuestionIndex >= battle.questions.length) {
        this.endBattle(battleId);
        return;
      }

      // Update battle state
      battleState.currentQuestionIndex = nextQuestionIndex;
      const currentQuestion = battle.questions[nextQuestionIndex];

      // Notify participants about the question change
      socketService.changeQuestion(
        battleId,
        currentQuestion.id,
        nextQuestionIndex
      );

      // Set up timer for this question
      const now = Date.now();
      const questionEndTime = now + currentQuestion.time_limit * 1000;

      // Sync timer with all participants
      socketService.syncTimer(battleId, {
        battle_id: battleId,
        question_id: currentQuestion.id,
        start_time: now,
        end_time: questionEndTime,
        time_remaining: currentQuestion.time_limit,
      });

      // Schedule next question
      const timer = setTimeout(() => {
        this.moveToNextQuestion(battleId);
      }, currentQuestion.time_limit * 1000);

      this.questionTimers.set(battleId, timer);

      logger.info(
        `Battle ${battleId} moved to question ${nextQuestionIndex + 1}/${battle.questions.length}`
      );
    } catch (error) {
      logger.error(
        `Error moving to next question in battle ${battleId}:`,
        error
      );
    }
  }

  /**
   * End a battle
   */
  async endBattle(battleId: string) {
    try {
      // Update battle status in database
      const battle = await prisma.battle.update({
        where: { id: battleId },
        data: { status: 'COMPLETED' },
        include: {
          participants: {
            orderBy: { score: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
      });

      // Clear any existing timers
      if (this.battleTimers.has(battleId)) {
        clearTimeout(this.battleTimers.get(battleId));
        this.battleTimers.delete(battleId);
      }

      if (this.questionTimers.has(battleId)) {
        clearTimeout(this.questionTimers.get(battleId));
        this.questionTimers.delete(battleId);
      }

      // Update battle state
      const battleState = this.battleStates.get(battleId);
      if (battleState) {
        battleState.status = 'COMPLETED';
      }

      // Notify all participants
      socketService.updateBattleState(battleId, {
        battle_id: battleId,
        status: 'COMPLETED',
        current_participants: battle.current_participants,
      });

      // Send final results
      socketService.completeBattle(battleId, {
        participants: battle.participants.map((p) => ({
          user_id: p.user_id,
          username: p.user.username,
          avatar_url: p.user.avatar_url,
          score: p.score,
          rank: p.rank,
        })),
      });

      // Clean up battle state
      this.battleStates.delete(battleId);

      logger.info(`Battle ${battleId} completed`);
    } catch (error) {
      logger.error(`Error ending battle ${battleId}:`, error);
    }
  }

  /**
   * Handle a participant joining a battle
   */
  async handleParticipantJoin(battleId: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          avatar_url: true,
        },
      });

      if (!user) {
        logger.error(
          `User ${userId} not found when joining battle ${battleId}`
        );
        return;
      }

      // Notify all participants about the new participant

      socketService.updateBattleState(battleId, {
        battle_id: battleId,
        status: this.battleStates.get(battleId)?.status || 'UPCOMING',
        current_participants: await this.getCurrentParticipantCount(battleId),
      });

      logger.info(`User ${userId} joined battle ${battleId}`);
    } catch (error) {
      logger.error(
        `Error handling participant join for battle ${battleId}:`,
        error
      );
    }
  }

  /**
   * Handle a score update for a participant
   */
  async handleScoreUpdate(battleId: string, userId: string, score: number) {
    try {
      // Update participant score in database
      const participant = await prisma.battleParticipant.update({
        where: {
          battle_id_user_id: {
            battle_id: battleId,
            user_id: userId,
          },
        },
        data: {
          score,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
        },
      });

      // Update rankings for all participants
      await this.updateRankings(battleId);

      // Get updated participant with rank
      const updatedParticipant = await prisma.battleParticipant.findUnique({
        where: {
          battle_id_user_id: {
            battle_id: battleId,
            user_id: userId,
          },
        },
      });

      if (!updatedParticipant) {
        logger.error(
          `Participant not found after score update: ${battleId}, ${userId}`
        );
        return;
      }

      // Notify all participants about the score update
      const scoreUpdate: ScoreUpdate = {
        battle_id: battleId,
        user_id: userId,
        username: participant.user.username,
        score: participant.score,
        rank: updatedParticipant.rank || 0,
      };

      socketService.updateScore(battleId, scoreUpdate);

      logger.info(
        `User ${userId} score updated in battle ${battleId}: ${score}`
      );
    } catch (error) {
      logger.error(
        `Error updating score for user ${userId} in battle ${battleId}:`,
        error
      );
    }
  }

  /**
   * Update rankings for all participants in a battle
   */
  private async updateRankings(battleId: string) {
    try {
      // Get all participants ordered by score
      const participants = await prisma.battleParticipant.findMany({
        where: { battle_id: battleId },
        orderBy: { score: 'desc' },
      });

      // Update ranks in a transaction
      const updates = participants.map((participant, index) => {
        return prisma.battleParticipant.update({
          where: { id: participant.id },
          data: { rank: index + 1 },
        });
      });

      await prisma.$transaction(updates);
    } catch (error) {
      logger.error(`Error updating rankings for battle ${battleId}:`, error);
    }
  }

  /**
   * Get the current number of participants in a battle
   */
  private async getCurrentParticipantCount(battleId: string): Promise<number> {
    try {
      const count = await prisma.battleParticipant.count({
        where: { battle_id: battleId },
      });
      return count;
    } catch (error) {
      logger.error(
        `Error getting participant count for battle ${battleId}:`,
        error
      );
      return 0;
    }
  }

  /**
   * Clean up resources for a battle
   */
  cleanupBattle(battleId: string) {
    // Clear any existing timers
    if (this.battleTimers.has(battleId)) {
      clearTimeout(this.battleTimers.get(battleId));
      this.battleTimers.delete(battleId);
    }

    if (this.questionTimers.has(battleId)) {
      clearTimeout(this.questionTimers.get(battleId));
      this.questionTimers.delete(battleId);
    }

    // Remove battle state
    this.battleStates.delete(battleId);

    logger.info(`Battle ${battleId} resources cleaned up`);
  }
}

export const battleSocketService = new BattleSocketService();
export default battleSocketService;
