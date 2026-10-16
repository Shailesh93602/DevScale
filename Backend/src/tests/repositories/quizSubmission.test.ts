/**
 * eduscale-backend#20-01 and #24-07 — how a quiz submission is graded.
 *
 * 20-01: passing_score is seeded as 70 (meaning 70%) on quizzes whose
 * questions are worth 10 points each, but the pass check compared raw points
 * (`totalScore >= passing_score`), so a 1-question quiz could never be passed.
 * 24-07: the score was summed per submitted answer, so repeating one correct
 * answer N times scored N × points, and nothing validated the body.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Router } from 'express';
import { submitQuizSchema } from '../../validations/quizValidations';

const quizFindUnique = jest.fn<(args: unknown) => Promise<unknown>>();
const submissionCreate = jest.fn(async (args: { data: unknown }) => args.data);
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    quiz: { findUnique: (a: unknown) => quizFindUnique(a) },
    quizSubmission: {
      create: (a: { data: unknown }) => submissionCreate(a),
    },
    userProgress: { upsert: jest.fn(async () => ({})) },
  },
}));
jest.mock('../../utils/codeExecutor', () => ({ executeCode: jest.fn() }));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import QuizRepository from '../../repositories/quizRepository';
import { QuizRouter } from '../../routes/quizRoutes';
import { TopicRoutes } from '../../routes/topicRoutes';

const quiz = (questions: Array<{ id: string; points: number }>) => ({
  id: 'quiz-1',
  topic_id: null,
  subject_id: null,
  main_concept_id: null,
  passing_score: 70,
  questions: questions.map((q) => ({
    ...q,
    type: 'mcq',
    correct_answer: 'right',
    test_cases: null,
  })),
});

type Graded = { score: number; is_passed: boolean };

describe('QuizRepository.submitQuiz', () => {
  const repo = new QuizRepository();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes a 1-question / 10-point quiz with passing_score 70 when the answer is right', async () => {
    quizFindUnique.mockResolvedValue(quiz([{ id: 'q1', points: 10 }]));
    const sub = (await repo.submitQuiz({
      user_id: 'u1',
      quiz_id: 'quiz-1',
      answers: [{ question_id: 'q1', answer: 'right' }],
      time_spent: 0,
    })) as unknown as Graded;
    expect(sub.score).toBe(10);
    expect(sub.is_passed).toBe(true);
  });

  it('fails below the percentage (1 of 2 right = 50% < 70%)', async () => {
    quizFindUnique.mockResolvedValue(
      quiz([
        { id: 'q1', points: 10 },
        { id: 'q2', points: 10 },
      ])
    );
    const sub = (await repo.submitQuiz({
      user_id: 'u1',
      quiz_id: 'quiz-1',
      answers: [
        { question_id: 'q1', answer: 'right' },
        { question_id: 'q2', answer: 'wrong' },
      ],
      time_spent: 0,
    })) as unknown as Graded;
    expect(sub.is_passed).toBe(false);
  });

  it('scores a repeated question once, not once per copy', async () => {
    quizFindUnique.mockResolvedValue(
      quiz([
        { id: 'q1', points: 10 },
        { id: 'q2', points: 10 },
        { id: 'q3', points: 10 },
        { id: 'q4', points: 10 },
      ])
    );
    const sub = (await repo.submitQuiz({
      user_id: 'u1',
      quiz_id: 'quiz-1',
      answers: Array(8).fill({ question_id: 'q1', answer: 'right' }),
      time_spent: 0,
    })) as unknown as Graded;
    expect(sub.score).toBe(10);
    expect(sub.is_passed).toBe(false);
  });

  it('refuses a non-array answers body with a 400, not a TypeError', async () => {
    quizFindUnique.mockResolvedValue(quiz([{ id: 'q1', points: 10 }]));
    await expect(
      repo.submitQuiz({
        user_id: 'u1',
        quiz_id: 'quiz-1',
        answers: 'nope' as unknown as [],
        time_spent: 0,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('submitQuizSchema', () => {
  it('rejects two answers to the same question', () => {
    const { error } = submitQuizSchema.validate({
      quiz_id: 'quiz-1',
      answers: [
        { question_id: 'q1', answer: 'a' },
        { question_id: 'q1', answer: 'a' },
      ],
    });
    expect(error).toBeDefined();
  });

  it('accepts a well-formed submission', () => {
    const { error } = submitQuizSchema.validate({
      quiz_id: 'quiz-1',
      answers: [{ question_id: 'q1', answer: 'a' }],
      time_spent: 12,
    });
    expect(error).toBeUndefined();
  });
});

const handlersOf = (router: Router, method: string, path: string) => {
  type Layer = {
    route?: {
      path: string;
      methods: Record<string, boolean>;
      stack: Array<{ name?: string }>;
    };
  };
  const layer = (router as unknown as { stack: Layer[] }).stack.find(
    (l) => l.route?.path === path && l.route.methods[method]
  );
  return layer?.route?.stack.map((h) => h.name) ?? [];
};

describe('both quiz submit routes validate the body', () => {
  it('POST /quiz/submit', () => {
    expect(
      handlersOf(new QuizRouter().getRouter(), 'post', '/submit')
    ).toContain('validateRequest');
  });
  it('POST /topics/quiz/submit', () => {
    expect(
      handlersOf(new TopicRoutes().getRouter(), 'post', '/quiz/submit')
    ).toContain('validateRequest');
  });
});
