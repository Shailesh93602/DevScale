// eduscale-backend#24-10 / #19-04 — a passed quiz writes progress only where a row can exist.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

type Fn = (...args: unknown[]) => Promise<unknown>;
const quizFindUnique = jest.fn<Fn>();
const progressUpsert = jest.fn<Fn>(async () => ({}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    quiz: { findUnique: (a: unknown) => quizFindUnique(a) },
    quizSubmission: { create: async (a: { data: unknown }) => a.data },
    userProgress: { upsert: (a: unknown) => progressUpsert(a) },
  },
}));
jest.mock('../../utils/codeExecutor', () => ({ executeCode: jest.fn() }));

import QuizRepository from '../../repositories/quizRepository';

const passingQuiz = (scope: Record<string, string | null>) => ({
  id: 'quiz-1',
  topic_id: null,
  subject_id: null,
  main_concept_id: null,
  ...scope,
  passing_score: 70,
  questions: [
    {
      id: 'q1',
      points: 10,
      type: 'mcq',
      correct_answer: 'right',
      test_cases: null,
    },
  ],
});
const submit = () =>
  new QuizRepository().submitQuiz({
    user_id: 'u1',
    quiz_id: 'quiz-1',
    answers: [{ question_id: 'q1', answer: 'right' }],
    time_spent: 0,
  });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('QuizRepository progress scope', () => {
  it.each<Record<string, string>>([
    { subject_id: 's1' },
    { main_concept_id: 'mc1' },
  ])('writes no UserProgress row for a %o quiz', async (scope) => {
    quizFindUnique.mockResolvedValue(passingQuiz(scope));
    await submit();
    expect(progressUpsert).not.toHaveBeenCalled();
  });

  it('records a topic quiz pass against that topic', async () => {
    quizFindUnique.mockResolvedValue(passingQuiz({ topic_id: 't1' }));
    await submit();
    expect(progressUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id_topic_id: { user_id: 'u1', topic_id: 't1' } },
      })
    );
  });

  it('surfaces a failed progress write instead of swallowing it', async () => {
    quizFindUnique.mockResolvedValue(passingQuiz({ topic_id: 't1' }));
    progressUpsert.mockRejectedValueOnce(new Error('db down'));
    await expect(submit()).rejects.toThrow('db down');
  });
});
