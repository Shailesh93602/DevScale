import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { BattleType, Difficulty, Length } from '@prisma/client';
import { BattleRepository } from '../repositories/battleRepository';
import { createAppError } from '../utils/createAppError';
import prisma from '../lib/prisma';
import { redis } from '../services/cacheService';

const battleRepo = new BattleRepository();

describe('Battle Creation', () => {
  jest.setTimeout(30000); // Increase timeout to 30 seconds

  let topicId: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();

    // Create a test user
    const user = await prisma.user.create({
      data: {
        supabase_id: 'test-supabase-id-' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        username: 'testuser' + Date.now(),
        first_name: 'Test',
        last_name: 'User',
      }
    });
    userId = user.id;

    // Create a test topic
    const topic = await prisma.topic.create({
      data: {
        title: 'Test Topic ' + Date.now(),
        description: 'Test Topic Description',
        order: 1,
      }
    });
    topicId = topic.id;
  });

  afterAll(async () => {
    // Cleanup
    if (userId) await prisma.user.delete({ where: { id: userId } });
    if (topicId) await prisma.topic.delete({ where: { id: topicId } });
    await prisma.$disconnect();
    await redis.quit();
  });

  it('should create a battle with valid data', async () => {
    const battleData = {
      title: 'Test Battle',
      description: 'Test Description',
      topic_id: topicId,
      difficulty: Difficulty.MEDIUM,
      length: Length.short,
      max_participants: 10,
      start_time: new Date(Date.now() + 3600000), // 1 hour from now
      end_time: new Date(Date.now() + 7200000), // 2 hours from now
      points_per_question: 10,
      time_per_question: 30,
      total_questions: 10,
      type: BattleType.INSTANT,
      user_id: userId,
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
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      length: Length.short,
      max_participants: 0, // Invalid max participants
      start_time: new Date(Date.now() - 3600000), // Past start time
      end_time: new Date(Date.now() - 7200000), // Past end time
      points_per_question: -1, // Invalid points
      time_per_question: 0, // Invalid time
      total_questions: 0, // Invalid questions
      type: BattleType.INSTANT,
      user_id: userId,
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
      topic_id: topicId,
      difficulty: Difficulty.MEDIUM,
      length: Length.short,
      max_participants: 10,
      start_time: new Date(Date.now() + 7200000), // 2 hours from now
      end_time: new Date(Date.now() + 3600000), // 1 hour from now (invalid: end before start)
      points_per_question: 10,
      time_per_question: 30,
      total_questions: 10,
      type: BattleType.INSTANT,
      user_id: userId,
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
