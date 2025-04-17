import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient, BattleType, Difficulty, Length } from '@prisma/client';
import { BattleRepository } from '../repositories/battleRepository';
import { createAppError } from '../utils/createAppError';

const prisma = new PrismaClient();
const battleRepo = new BattleRepository();

describe('Battle Creation', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create a battle with valid data', async () => {
    const battleData = {
      title: 'Test Battle',
      description: 'Test Description',
      topic_id: 'test-topic-id',
      difficulty: Difficulty.MEDIUM,
      length: Length.short,
      max_participants: 10,
      start_time: new Date(Date.now() + 3600000), // 1 hour from now
      end_time: new Date(Date.now() + 7200000), // 2 hours from now
      points_per_question: 10,
      time_per_question: 30,
      total_questions: 10,
      type: BattleType.INSTANT,
      user_id: 'test-user-id',
    };

    const battle = await battleRepo.create({
      data: battleData,
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

    expect(battle).toBeDefined();
    expect(battle.title).toBe(battleData.title);
    expect(battle.status).toBe('UPCOMING');
  });

  it('should fail to create a battle with invalid data', async () => {
    const invalidBattleData = {
      title: '', // Empty title
      description: 'Test Description',
      topic_id: 'test-topic-id',
      difficulty: Difficulty.EASY,
      length: Length.short,
      max_participants: 0, // Invalid max participants
      start_time: new Date(Date.now() - 3600000), // Past start time
      end_time: new Date(Date.now() - 7200000), // Past end time
      points_per_question: -1, // Invalid points
      time_per_question: 0, // Invalid time
      total_questions: 0, // Invalid questions
      type: BattleType.INSTANT,
      user_id: 'test-user-id',
    };

    await expect(
      battleRepo.create({
        data: invalidBattleData,
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
      })
    ).rejects.toThrow();
  });

  it('should validate battle time constraints', async () => {
    const invalidTimeData = {
      title: 'Test Battle',
      description: 'Test Description',
      topic_id: 'test-topic-id',
      difficulty: Difficulty.MEDIUM,
      length: Length.short,
      max_participants: 10,
      start_time: new Date(Date.now() + 7200000), // 2 hours from now
      end_time: new Date(Date.now() + 3600000), // 1 hour from now (invalid: end before start)
      points_per_question: 10,
      time_per_question: 30,
      total_questions: 10,
      type: BattleType.INSTANT,
      user_id: 'test-user-id',
    };

    await expect(
      battleRepo.create({
        data: invalidTimeData,
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
      })
    ).rejects.toThrow(createAppError('End time must be after start time', 400));
  });
});
