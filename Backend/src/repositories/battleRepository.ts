import {
  BattleStatus,
  BattleType,
  Difficulty,
  Length,
  PrismaClient,
  Prisma,
  Battle,
} from '@prisma/client';
import BaseRepository from './baseRepository';
import { createAppError } from '@/utils/errorHandler';
import prisma from '@/lib/prisma';
import logger from '@/utils/logger';
import {
  getCache,
  setCache,
  deleteCache,
  getOrSetCache,
} from '@/services/cacheService';
import { PerformanceMonitor } from '@/services/monitoring/performanceMonitor';

interface BattleListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  cacheControl?: string;
  etag?: string;
}

interface BattleListResponse {
  data: any[];
  meta: BattleListMeta;
}

export class BattleRepository extends BaseRepository<PrismaClient['battle']> {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static readonly BATTLE_CACHE_PREFIX = 'battle:';
  private static readonly BATTLE_LIST_CACHE_PREFIX = 'battle:list:';
  private prisma: PrismaClient;

  constructor() {
    super(prisma.battle);
    this.prisma = new PrismaClient();
  }

  /**
   * Get battle with detailed information including topic, creator, participants, and questions
   */
  async getBattleDetails(id: string) {
    const startTime = Date.now();
    try {
      const cacheKey = `${BattleRepository.BATTLE_CACHE_PREFIX}${id}`;

      return await getOrSetCache(
        cacheKey,
        async () => {
          const battle = await this.findUnique({
            where: { id },
            include: {
              topic: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                },
              },
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      avatar_url: true,
                    },
                  },
                },
                orderBy: {
                  score: 'desc',
                },
                take: 10, // Limit to top 10 participants for performance
              },
              questions: {
                orderBy: {
                  order: 'asc',
                },
                select: {
                  id: true,
                  question: true,
                  options: true,
                  points: true,
                  time_limit: true,
                  order: true,
                },
              },
            },
          });

          if (!battle) {
            throw createAppError('Battle not found', 404);
          }

          return battle;
        },
        { ttl: BattleRepository.CACHE_TTL }
      );
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest('GET', `/battles/${id}`, duration, 200);
    }
  }

  /**
   * Get battles with pagination, filtering, and sorting
   */
  async getBattles(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BattleStatus;
    difficulty?: Difficulty;
    type?: BattleType;
    length?: Length;
    topic_id?: string;
    user_id?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<BattleListResponse> {
    const startTime = Date.now();
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        difficulty,
        type,
        length,
        topic_id,
        user_id,
        sort_by = 'created_at',
        sort_order = 'desc',
      } = params;

      // Generate cache key based on filters
      const cacheKey = `${BattleRepository.BATTLE_LIST_CACHE_PREFIX}${JSON.stringify(params)}`;

      const result = await getOrSetCache(
        cacheKey,
        async () => {
          const where: Prisma.BattleWhereInput = {
            ...(search && {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }),
            ...(status && { status }),
            ...(difficulty && { difficulty }),
            ...(type && { type }),
            ...(length && { length }),
            ...(topic_id && { topic_id }),
            ...(user_id && { user_id }),
          };

          const [total, battles] = await Promise.all([
            this.count({ where }),
            this.findMany({
              where,
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
              orderBy: {
                [sort_by]: sort_order,
              },
              skip: (page - 1) * limit,
              take: limit,
            }),
          ]);

          const response: BattleListResponse = {
            data: battles.map((battle) => ({
              ...battle,
              current_participants: battle.max_participants,
            })),
            meta: {
              total,
              page,
              limit,
              totalPages: Math.ceil(total / limit),
              cacheControl: 'public, max-age=3600',
              etag: require('crypto')
                .createHash('md5')
                .update(JSON.stringify(battles))
                .digest('hex'),
            },
          };

          return response;
        },
        { ttl: BattleRepository.CACHE_TTL }
      );

      return result;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest('GET', '/battles', duration, 200);
    }
  }

  /**
   * Update a battle
   */
  async updateBattle(id: string, data: any, userId: string) {
    const startTime = Date.now();
    try {
      // First check if the battle exists and belongs to the user
      const battle = await this.findUnique({
        where: { id },
        select: { user_id: true, status: true },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if the user is the creator of the battle
      if (battle.user_id !== userId) {
        throw createAppError(
          'You are not authorized to update this battle',
          403
        );
      }

      // Check if the battle is already completed or cancelled
      if (battle.status === 'COMPLETED' || battle.status === 'CANCELLED') {
        throw createAppError(
          `Cannot update a battle that is ${battle.status.toLowerCase()}`,
          400
        );
      }

      // Update the battle
      const updatedBattle = await this.update({
        where: { id },
        data,
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

      // Invalidate related caches
      await Promise.all([
        deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`),
        deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
      ]);

      return updatedBattle;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest('PUT', `/battles/${id}`, duration, 200);
    }
  }

  /**
   * Delete a battle with proper cleanup
   */
  async deleteBattle(id: string, userId: string) {
    const startTime = Date.now();
    try {
      const battle = await prisma.battle.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              participants: true,
              questions: true,
            },
          },
        },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if the user is the creator of the battle
      if (battle.user_id !== userId) {
        throw createAppError(
          'You are not authorized to delete this battle',
          403
        );
      }

      // If the battle has participants, update the status to CANCELLED instead of deleting
      if (battle._count.participants > 0) {
        logger.info(
          `Battle ${id} has participants, updating status to CANCELLED`
        );

        // Use a transaction to ensure all related data is updated
        const updatedBattle = await prisma.$transaction(async (tx) => {
          // Update battle status to CANCELLED
          const battle = await tx.battle.update({
            where: { id },
            data: {
              status: 'CANCELLED',
            },
          });

          // Notify participants about cancellation (this would be handled by the controller)

          return battle;
        });

        // Invalidate related caches
        await Promise.all([
          deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`),
          deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
        ]);

        return updatedBattle;
      }

      // If no participants, delete the battle and all related data
      const deletedBattle = await prisma.$transaction(async (tx) => {
        // First get all question IDs for this battle
        const questions = await tx.battleQuestion.findMany({
          where: { battle_id: id },
          select: { id: true },
        });

        const questionIds = questions.map((q) => q.id);

        // Delete battle answers for all questions in this battle
        if (questionIds.length > 0) {
          await tx.battleAnswer.deleteMany({
            where: {
              question_id: {
                in: questionIds,
              },
            },
          });
        }

        // Delete battle questions
        await tx.battleQuestion.deleteMany({
          where: { battle_id: id },
        });

        // Delete battle participants
        await tx.battleParticipant.deleteMany({
          where: { battle_id: id },
        });

        // Delete the battle
        const battle = await tx.battle.delete({
          where: { id },
        });

        return battle;
      });

      // Invalidate related caches
      await Promise.all([
        deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`),
        deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
      ]);

      return deletedBattle;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest(
        'DELETE',
        `/battles/${id}`,
        duration,
        200
      );
    }
  }

  /**
   * Join a battle
   */
  async joinBattle(battleId: string, userId: string) {
    const startTime = Date.now();
    try {
      // Check if battle exists and has capacity
      const battle = await this.findUnique({
        where: { id: battleId },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if battle is in a joinable state
      if (battle.status !== 'UPCOMING') {
        throw createAppError(
          `Cannot join a battle that is ${battle.status.toLowerCase()}`,
          400
        );
      }

      // Check if battle has capacity
      if (battle.current_participants >= battle.max_participants) {
        throw createAppError('Battle is full', 400);
      }

      // Check if user is already a participant
      const existingParticipant = await prisma.battleParticipant.findUnique({
        where: {
          battle_id_user_id: {
            battle_id: battleId,
            user_id: userId,
          },
        },
      });

      if (existingParticipant) {
        throw createAppError(
          'You are already a participant in this battle',
          400
        );
      }

      // Create participant and update battle count in a transaction
      const [participant, updatedBattle] = await prisma.$transaction([
        prisma.battleParticipant.create({
          data: {
            battle_id: battleId,
            user_id: userId,
            score: 0,
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
        }),
        prisma.battle.update({
          where: { id: battleId },
          data: {
            current_participants: { increment: 1 },
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
        }),
      ]);

      // Invalidate related caches
      await Promise.all([
        deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${battleId}`),
        deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
      ]);

      return { participant, battle: updatedBattle };
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest(
        'POST',
        `/battles/${battleId}/join`,
        duration,
        200
      );
    }
  }

  /**
   * Get battle questions
   */
  async getBattleQuestions(battleId: string, userId: string) {
    // Check if battle exists
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: {
          where: { user_id: userId },
        },
      },
    });

    if (!battle) {
      throw createAppError('Battle not found', 404);
    }

    // Check if user is a participant or creator
    const isParticipant = battle.participants.length > 0;
    const isCreator = battle.user_id === userId;

    if (!isParticipant && !isCreator) {
      throw createAppError(
        "You do not have access to this battle's questions",
        403
      );
    }

    // Get questions without correct answers for participants
    const questions = await prisma.battleQuestion.findMany({
      where: { battle_id: battleId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        question: true,
        options: true,
        points: true,
        time_limit: true,
        order: true,
        // Only include correct_answer for the creator
        ...(isCreator ? { correct_answer: true } : {}),
      },
    });

    // Randomize question order for participants (but not for creator)
    if (isParticipant && !isCreator && battle.status === 'IN_PROGRESS') {
      // Fisher-Yates shuffle algorithm
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    return questions;
  }

  /**
   * Submit an answer to a battle question
   */
  async submitAnswer(
    battleId: string,
    questionId: string,
    userId: string,
    answer: string,
    timeTaken: number
  ) {
    // Check if battle exists and is in progress
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: {
          where: { user_id: userId },
        },
      },
    });

    if (!battle) {
      throw createAppError('Battle not found', 404);
    }

    if (battle.status !== 'IN_PROGRESS') {
      throw createAppError(
        `Cannot submit answers to a battle that is ${battle.status.toLowerCase()}`,
        400
      );
    }

    // Check if user is a participant
    if (battle.participants.length === 0) {
      throw createAppError('You are not a participant in this battle', 403);
    }

    // Check if question exists and belongs to the battle
    const question = await prisma.battleQuestion.findFirst({
      where: {
        id: questionId,
        battle_id: battleId,
      },
    });

    if (!question) {
      throw createAppError(
        'Question not found or does not belong to this battle',
        404
      );
    }

    // Check if answer has already been submitted
    const existingAnswer = await prisma.battleAnswer.findUnique({
      where: {
        question_id_user_id: {
          question_id: questionId,
          user_id: userId,
        },
      },
    });

    if (existingAnswer) {
      throw createAppError(
        'You have already submitted an answer for this question',
        400
      );
    }

    // Check if time taken is reasonable
    if (timeTaken < 0 || timeTaken > question.time_limit * 2) {
      throw createAppError('Invalid time taken for submission', 400);
    }

    // Determine if answer is correct
    const isCorrect = answer === question.correct_answer;

    // Calculate score based on correctness and time taken
    let score = 0;
    if (isCorrect) {
      // Base score for correct answer
      score = question.points;

      // Bonus for quick answers (up to 50% bonus for answering in half the time)
      if (timeTaken < question.time_limit) {
        const timeBonus = Math.floor(
          question.points * 0.5 * (1 - timeTaken / question.time_limit)
        );
        score += timeBonus;
      }
    }

    // Create answer and update participant score in a transaction
    const [battleAnswer, updatedParticipant] = await prisma.$transaction([
      prisma.battleAnswer.create({
        data: {
          question_id: questionId,
          user_id: userId,
          answer,
          is_correct: isCorrect,
          time_taken: timeTaken,
        },
      }),
      prisma.battleParticipant.update({
        where: {
          battle_id_user_id: {
            battle_id: battleId,
            user_id: userId,
          },
        },
        data: {
          score: { increment: score },
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
      }),
    ]);

    // Update leaderboard
    await this.updateLeaderboard(battleId);

    return {
      answer: battleAnswer,
      participant: updatedParticipant,
      score,
      isCorrect,
    };
  }

  /**
   * Get battle leaderboard
   */
  async getBattleLeaderboard(battleId: string, limit = 10, page = 1) {
    // Check if battle exists
    const battle = await this.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      throw createAppError('Battle not found', 404);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get participants ordered by score
    const participants = await prisma.battleParticipant.findMany({
      where: { battle_id: battleId },
      orderBy: { score: 'desc' },
      skip,
      take: limit,
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

    // Get total count for pagination
    const total = await prisma.battleParticipant.count({
      where: { battle_id: battleId },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: participants,
      meta: {
        total,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Update battle leaderboard with current rankings
   * This is called after each answer submission
   */
  private async updateLeaderboard(battleId: string) {
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

    return participants.length;
  }

  async updateBattleStatus(id: string, status: BattleStatus): Promise<Battle> {
    const startTime = Date.now();
    try {
      const battle = await this.prisma.battle.update({
        where: { id },
        data: { status },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
          participants: {
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

      // Invalidate cache
      await deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`);
      await deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`);

      return battle;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest(
        'PATCH',
        `/battles/${id}/status`,
        duration,
        200
      );
    }
  }

  /**
   * Reschedule a battle
   */
  async rescheduleBattle(
    id: string,
    userId: string,
    startTime: Date,
    endTime: Date
  ) {
    const startTimeMs = Date.now();
    try {
      const battle = await this.findUnique({
        where: { id },
        select: {
          user_id: true,
          status: true,
          current_participants: true,
        },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if the user is the creator of the battle
      if (battle.user_id !== userId) {
        throw createAppError(
          'You are not authorized to reschedule this battle',
          403
        );
      }

      // Check if the battle is in a reschedulable state
      if (battle.status !== 'UPCOMING') {
        throw createAppError('Only upcoming battles can be rescheduled', 400);
      }

      // Check if the battle has participants
      if (battle.current_participants > 0) {
        throw createAppError(
          'Cannot reschedule a battle with participants',
          400
        );
      }

      // Validate start and end times
      if (startTime >= endTime) {
        throw createAppError('End time must be after start time', 400);
      }

      // Update the battle with new start and end times
      const updatedBattle = await this.update({
        where: { id },
        data: {
          start_time: startTime,
          end_time: endTime,
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

      // Invalidate related caches
      await Promise.all([
        deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`),
        deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
      ]);

      return updatedBattle;
    } finally {
      const duration = Date.now() - startTimeMs;
      PerformanceMonitor.trackRequest(
        'PATCH',
        `/battles/${id}/reschedule`,
        duration,
        200
      );
    }
  }

  /**
   * Archive a battle
   */
  async archiveBattle(id: string, userId: string) {
    const startTime = Date.now();
    try {
      const battle = await prisma.battle.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });

      if (!battle) {
        throw createAppError('Battle not found', 404);
      }

      // Check if the user is the creator of the battle
      if (battle.user_id !== userId) {
        throw createAppError(
          'You are not authorized to archive this battle',
          403
        );
      }

      // Only completed or cancelled battles can be archived
      if (battle.status !== 'COMPLETED' && battle.status !== 'CANCELLED') {
        throw createAppError(
          'Only completed or cancelled battles can be archived',
          400
        );
      }

      // Update the battle status to ARCHIVED
      const archivedBattle = await prisma.battle.update({
        where: { id },
        data: {
          status: BattleStatus.ARCHIVED,
        },
      });

      // Invalidate related caches
      await Promise.all([
        deleteCache(`${BattleRepository.BATTLE_CACHE_PREFIX}${id}`),
        deleteCache(`${BattleRepository.BATTLE_LIST_CACHE_PREFIX}*`),
      ]);

      return archivedBattle;
    } finally {
      const duration = Date.now() - startTime;
      PerformanceMonitor.trackRequest(
        'PATCH',
        `/battles/${id}/archive`,
        duration,
        200
      );
    }
  }
}
