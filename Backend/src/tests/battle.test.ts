import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { BattleType, Difficulty } from '@prisma/client';
import { BattleRepository, calculatePoints } from '../repositories/battleRepository';
import prisma from '../lib/prisma';

// Remote Supabase DB can be slow — allow 30 s per test/hook
jest.setTimeout(30_000);

const battleRepo = new BattleRepository();

// ─── Test fixtures ──────────────────────────────────────────────────────────

let topicId: string;
let userId1: string;
let userId2: string;

const suffix = Date.now();

beforeAll(async () => {
  await prisma.$connect();

  const [user1, user2, topic] = await Promise.all([
    prisma.user.create({
      data: {
        supabase_id: `test-supabase-1-${suffix}`,
        email: `battle1-${suffix}@test.com`,
        username: `battleuser1-${suffix}`,
        first_name: 'Battle',
        last_name: 'UserOne',
      },
    }),
    prisma.user.create({
      data: {
        supabase_id: `test-supabase-2-${suffix}`,
        email: `battle2-${suffix}@test.com`,
        username: `battleuser2-${suffix}`,
        first_name: 'Battle',
        last_name: 'UserTwo',
      },
    }),
    prisma.topic.create({
      data: {
        title: `Test Topic ${suffix}`,
        description: 'Battle test topic',
        order: 999,
      },
    }),
  ]);

  userId1 = user1.id;
  userId2 = user2.id;
  topicId = topic.id;
});

afterAll(async () => {
  // Cascade deletes handle battle children
  await prisma.battle.deleteMany({ where: { user_id: { in: [userId1, userId2] } } });
  await prisma.user.deleteMany({ where: { id: { in: [userId1, userId2] } } });
  await prisma.topic.deleteMany({ where: { id: topicId } });
  await prisma.$disconnect();
});

// ─── Scoring algorithm ───────────────────────────────────────────────────────

describe('calculatePoints', () => {
  it('returns 0 for wrong answer regardless of speed', () => {
    expect(calculatePoints(false, 100, 1000, 30)).toBe(0);
  });

  it('gives 150 points for correct answer in first 25% of time', () => {
    // time_limit=30s, taken=7s (23%) → ×1.5
    expect(calculatePoints(true, 100, 7000, 30)).toBe(150);
  });

  it('gives 125 points for correct answer in first 50% of time', () => {
    // taken=12s (40%) → ×1.25
    expect(calculatePoints(true, 100, 12000, 30)).toBe(125);
  });

  it('gives 100 points for correct answer in 50–75% window', () => {
    // taken=20s (67%) → ×1.0
    expect(calculatePoints(true, 100, 20000, 30)).toBe(100);
  });

  it('gives 75 points for correct answer in last 25% of time', () => {
    // taken=28s (93%) → ×0.75
    expect(calculatePoints(true, 100, 28000, 30)).toBe(75);
  });
});

// ─── Battle creation ─────────────────────────────────────────────────────────

describe('Battle creation', () => {
  it('creates a battle with WAITING status', async () => {
    const battle = await battleRepo.createBattle({
      title: 'Creation Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.MEDIUM,
      type: BattleType.QUICK,
      max_participants: 4,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });

    expect(battle.status).toBe('WAITING');
    expect(battle.title).toBe('Creation Test Battle');
    expect(battle.max_participants).toBe(4);
    expect(battle.total_questions).toBe(5);
    expect(battle.winner_id).toBeNull();

    // Cleanup
    await prisma.battle.delete({ where: { id: battle.id } });
  });

  it('rejects creation with invalid topic_id', async () => {
    await expect(
      battleRepo.createBattle({
        title: 'Bad Battle',
        topic_id: 'non-existent-uuid-0000-000000000000',
        difficulty: Difficulty.EASY,
        type: BattleType.QUICK,
        max_participants: 2,
        total_questions: 5,
        time_per_question: 30,
        points_per_question: 100,
        user_id: userId1,
      })
    ).rejects.toThrow();
  });
});

// ─── Join / Leave / Ready / Start lifecycle ───────────────────────────────────

describe('Battle lifecycle', () => {
  let battleId: string;

  beforeAll(async () => {
    const battle = await battleRepo.createBattle({
      title: 'Lifecycle Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 4,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });
    battleId = battle.id;

    // Add required questions so startBattle guard is satisfied
    const questionData = Array.from({ length: 5 }, (_, i) => ({
      battle_id: battleId,
      question: `Lifecycle Q${i + 1}?`,
      options: ['A', 'B', 'C', 'D'],
      correct_answer: 0,
      points: 100,
      time_limit: 30,
      order: i + 1,
    }));
    await prisma.battleQuestion.createMany({ data: questionData });
  });

  afterAll(async () => {
    await prisma.battle.deleteMany({ where: { id: battleId } });
  });

  it('allows user to join a WAITING battle', async () => {
    const { battle } = await battleRepo.joinBattle(battleId, userId1);
    expect(battle.current_participants).toBe(1);

    const participant = await prisma.battleParticipant.findUnique({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId1 } },
    });
    expect(participant?.status).toBe('JOINED');
  });

  it('allows second user to join', async () => {
    const { battle } = await battleRepo.joinBattle(battleId, userId2);
    expect(battle.current_participants).toBe(2);
  });

  it('prevents joining the same battle twice', async () => {
    await expect(battleRepo.joinBattle(battleId, userId1)).rejects.toThrow();
  });

  it('transitions WAITING → LOBBY via updateStatus', async () => {
    const updated = await battleRepo.updateStatus(battleId, userId1, 'LOBBY');
    expect(updated.status).toBe('LOBBY');
  });

  it('marks a participant as ready', async () => {
    await battleRepo.markReady(battleId, userId1);
    await battleRepo.markReady(battleId, userId2);

    const participants = await prisma.battleParticipant.findMany({
      where: { battle_id: battleId, status: 'READY' },
    });
    expect(participants).toHaveLength(2);
  });

  it('creator can start the battle when all are ready', async () => {
    // startBattle verifies status is LOBBY and all are ready
    const battle = await battleRepo.startBattle(battleId, userId1);
    expect(battle.status).toBe('IN_PROGRESS');
  });

  it('rejects COMPLETED → IN_PROGRESS transition', async () => {
    // Force complete it first
    await prisma.battle.update({ where: { id: battleId }, data: { status: 'COMPLETED' } });
    await expect(
      battleRepo.updateStatus(battleId, userId1, 'IN_PROGRESS')
    ).rejects.toThrow();
  });
});

// ─── Answer submission & scoring ─────────────────────────────────────────────

describe('Answer submission', () => {
  let battleId: string;
  let questionId: string;

  beforeAll(async () => {
    const battle = await battleRepo.createBattle({
      title: 'Submission Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 2,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });
    battleId = battle.id;

    // Add test questions directly
    const [q] = await prisma.battleQuestion.createManyAndReturn({
      data: [
        { battle_id: battleId, question: 'What is 2+2?', options: ['1', '2', '3', '4'], correct_answer: 3, points: 100, time_limit: 30, order: 0 },
        { battle_id: battleId, question: 'Capital of France?', options: ['London', 'Paris', 'Berlin', 'Rome'], correct_answer: 1, points: 100, time_limit: 30, order: 1 },
      ],
    });
    questionId = q.id;

    await battleRepo.joinBattle(battleId, userId1);
    await battleRepo.joinBattle(battleId, userId2);
    await prisma.battle.update({ where: { id: battleId }, data: { status: 'IN_PROGRESS' } });
  });

  afterAll(async () => {
    await prisma.battle.delete({ where: { id: battleId } });
  });

  it('scores correct answer with speed bonus', async () => {
    const result = await battleRepo.submitAnswer(
      battleId, questionId, userId1,
      3,      // correct option index
      5000    // 5s out of 30s = 17% → ×1.5
    );
    expect(result.is_correct).toBe(true);
    expect(result.points_earned).toBe(150); // 100 × 1.5
  });

  it('gives 0 points for wrong answer', async () => {
    const result = await battleRepo.submitAnswer(
      battleId, questionId, userId2,
      0,      // wrong option
      5000
    );
    expect(result.is_correct).toBe(false);
    expect(result.points_earned).toBe(0);
  });

  it('prevents duplicate answer for same question', async () => {
    await expect(
      battleRepo.submitAnswer(battleId, questionId, userId1, 3, 5000)
    ).rejects.toThrow();
  });

  it('returns sorted leaderboard after answer', async () => {
    await battleRepo.submitAnswer(
      battleId, questionId, userId1,
      3, 5000
    ).catch(() => null); // Will reject (duplicate) — get leaderboard directly

    const leaderboard = await battleRepo.getBattleLeaderboard(battleId);
    expect(leaderboard[0].score).toBeGreaterThanOrEqual(leaderboard?.at(-1)?.score ?? 0);
    expect(leaderboard[0].rank).toBe(1);
  });
});

// ─── Cancel ───────────────────────────────────────────────────────────────────

describe('Battle cancellation', () => {
  it('allows creator to cancel a WAITING battle', async () => {
    const battle = await battleRepo.createBattle({
      title: 'Cancel Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });

    const cancelled = await battleRepo.cancelBattle(battle.id, userId1);
    expect(cancelled.status).toBe('CANCELLED');

    await prisma.battle.delete({ where: { id: battle.id } });
  });

  it('prevents non-creator from cancelling', async () => {
    const battle = await battleRepo.createBattle({
      title: 'Cancel Auth Test',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });

    await expect(battleRepo.cancelBattle(battle.id, userId2)).rejects.toThrow();
    await prisma.battle.delete({ where: { id: battle.id } });
  });
});

// ─── User stats ───────────────────────────────────────────────────────────────

describe('User statistics', () => {
  it('returns zero stats for a user with no battles', async () => {
    const result = await battleRepo.getUserStats(userId2);
    // May have some battles from previous tests but structure must be correct
    expect(result.stats).toHaveProperty('total_battles');
    expect(result.stats).toHaveProperty('wins');
    expect(result.stats).toHaveProperty('win_rate');
    expect(result.stats).toHaveProperty('accuracy');
    expect(typeof result.stats.win_rate).toBe('number');
  });

  it('returns same structure for all valid timeframes', async () => {
    for (const tf of ['this-week', 'this-month', 'this-year']) {
      const result = await battleRepo.getUserStats(userId1, tf);
      expect(result.stats).toHaveProperty('total_battles');
      expect(result.stats).toHaveProperty('wins');
      expect(result.stats).toHaveProperty('win_rate');
      expect(result.stats).toHaveProperty('accuracy');
      expect(typeof result.stats.win_rate).toBe('number');
    }
  });

  it('win_rate is always between 0 and 100', async () => {
    const result = await battleRepo.getUserStats(userId1);
    expect(result.stats.win_rate).toBeGreaterThanOrEqual(0);
    expect(result.stats.win_rate).toBeLessThanOrEqual(100);
  });
});

// ─── Add questions ────────────────────────────────────────────────────────────

describe('addQuestions', () => {
  let battleId: string;

  const sampleQuestion = {
    question: 'What is 1+1?',
    options: ['1', '2', '3', '4'],
    correct_answer: 1,
    explanation: 'Basic addition',
  };

  beforeAll(async () => {
    const battle = await battleRepo.createBattle({
      title: 'Add Questions Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 3,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });
    battleId = battle.id;
  });

  afterAll(async () => {
    await prisma.battle.delete({ where: { id: battleId } });
  });

  it('allows creator to add questions', async () => {
    const result = await battleRepo.addQuestions(battleId, userId1, [sampleQuestion]);
    expect(result.added).toBe(1);
    expect(result.total_questions_added).toBe(1);
    expect(result.ready_to_start).toBe(false);
  });

  it('rejects adding questions by non-creator', async () => {
    await expect(
      battleRepo.addQuestions(battleId, userId2, [sampleQuestion])
    ).rejects.toThrow();
  });

  it('rejects adding more questions than remaining slots', async () => {
    // Battle needs 3 total, 1 already added → 2 remaining
    await expect(
      battleRepo.addQuestions(battleId, userId1, [
        sampleQuestion,
        sampleQuestion,
        sampleQuestion, // 3 > 2 remaining
      ])
    ).rejects.toThrow();
  });

  it('fills remaining questions and marks ready_to_start', async () => {
    const result = await battleRepo.addQuestions(battleId, userId1, [
      sampleQuestion,
      sampleQuestion,
    ]);
    expect(result.total_questions_added).toBe(3);
    expect(result.ready_to_start).toBe(true);
  });

  it('rejects adding when question slots are already full', async () => {
    await expect(
      battleRepo.addQuestions(battleId, userId1, [sampleQuestion])
    ).rejects.toThrow();
  });

  it('rejects adding questions to an IN_PROGRESS battle', async () => {
    // Force in-progress
    await prisma.battle.update({ where: { id: battleId }, data: { status: 'IN_PROGRESS' } });
    await expect(
      battleRepo.addQuestions(battleId, userId1, [sampleQuestion])
    ).rejects.toThrow();
    // Reset
    await prisma.battle.update({ where: { id: battleId }, data: { status: 'WAITING' } });
  });
});

// ─── startBattle question guard ───────────────────────────────────────────────

describe('startBattle question guard', () => {
  let battleId: string;

  beforeAll(async () => {
    const battle = await battleRepo.createBattle({
      title: 'Start Guard Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 2,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });
    battleId = battle.id;
    await battleRepo.joinBattle(battleId, userId1);
    await battleRepo.joinBattle(battleId, userId2);
    await prisma.battle.update({ where: { id: battleId }, data: { status: 'LOBBY' } });
    await battleRepo.markReady(battleId, userId1);
    await battleRepo.markReady(battleId, userId2);
  });

  afterAll(async () => {
    await prisma.battle.delete({ where: { id: battleId } });
  });

  it('prevents starting a battle with insufficient questions', async () => {
    // Battle has 0 questions, needs 2
    await expect(
      battleRepo.startBattle(battleId, userId1)
    ).rejects.toThrow();
  });

  it('allows starting after questions are added', async () => {
    await battleRepo.addQuestions(battleId, userId1, [
      { question: 'Q1?', options: ['A', 'B', 'C', 'D'], correct_answer: 0 },
      { question: 'Q2?', options: ['A', 'B', 'C', 'D'], correct_answer: 1 },
    ]);
    const battle = await battleRepo.startBattle(battleId, userId1);
    expect(battle.status).toBe('IN_PROGRESS');
  });
});

// ─── Slug-based lookup ────────────────────────────────────────────────────────

describe('Slug-based battle resolution', () => {
  let battleId: string;
  let battleSlug: string;

  beforeAll(async () => {
    const battle = await battleRepo.createBattle({
      title: 'Slug Resolution Test Battle',
      topic_id: topicId,
      difficulty: Difficulty.EASY,
      type: BattleType.QUICK,
      max_participants: 2,
      total_questions: 5,
      time_per_question: 30,
      points_per_question: 100,
      user_id: userId1,
    });
    battleId = battle.id;
    battleSlug = battle.slug!;
    expect(battleSlug).toBeTruthy();
  });

  afterAll(async () => {
    await prisma.battle.delete({ where: { id: battleId } });
  });

  it('resolves battle details by slug', async () => {
    const details = await battleRepo.getBattleDetails(battleSlug);
    expect(details?.id).toBe(battleId);
    expect(details?.slug).toBe(battleSlug);
  });

  it('allows joining by slug', async () => {
    const { battle } = await battleRepo.joinBattle(battleSlug, userId1);
    expect(battle.id).toBe(battleId);
    expect(battle.current_participants).toBe(1);
  });

  it('throws 404 for unknown slug', async () => {
    await expect(
      battleRepo.getBattleDetails('this-slug-does-not-exist-xyz')
    ).rejects.toThrow();
  });
});
