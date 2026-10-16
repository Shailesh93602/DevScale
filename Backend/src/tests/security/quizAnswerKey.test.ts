/**
 * eduscale-backend#22-02 / #24-06 — GET /topics/:id/quiz sent the answer key.
 *
 * The handler included `questions.options` with no select, so every
 * Question.correct_answer, Option.is_correct and test_cases went to the
 * learner before they submitted — the exact values submitQuiz grades against.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { project } from '../helpers/prismaProjection';
import { runHandler } from '../helpers/runHandler';

const topicRow = {
  id: 'topic-1',
  title: 'Loops',
  quizzes: [
    {
      id: 'quiz-1',
      title: 'Loops quiz',
      passing_score: 70,
      questions: [
        {
          id: 'q1',
          quiz_id: 'quiz-1',
          question: 'What does break do?',
          type: 'mcq',
          points: 10,
          correct_answer: 'Exits the loop',
          // Json column; a string so the projection helper treats it as a scalar.
          test_cases: '[{"hidden":"expected output"}]',
          options: [
            {
              id: 'o1',
              text: 'Exits the loop',
              is_correct: true,
              question_id: 'q1',
            },
            {
              id: 'o2',
              text: 'Skips one turn',
              is_correct: false,
              question_id: 'q1',
            },
          ],
        },
      ],
    },
  ],
};

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    topic: {
      findUnique: async (args: { include?: unknown; select?: unknown }) =>
        project(topicRow, args),
    },
  },
}));

import TopicController from '../../controllers/topicController';

describe('GET /topics/:id/quiz', () => {
  it('returns the questions and options without the answer key', async () => {
    const out = await runHandler(new TopicController().getQuizByTopicId, {
      params: { id: 'topic-1' },
    });
    const body = JSON.stringify(out.body);

    // Still a usable quiz…
    expect(body).toContain('What does break do?');
    expect(body).toContain('Skips one turn');
    // …but nothing the grader compares against.
    expect(body).not.toContain('correct_answer');
    expect(body).not.toContain('is_correct');
    expect(body).not.toContain('test_cases');
  });
});
