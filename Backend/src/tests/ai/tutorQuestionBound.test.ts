/** POST /tutor/ask passed any question length into the embedding call and the prompt. */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const answerQuestion = jest.fn(async () => ({ answer: 'ok' }));
jest.mock('../../services/ai/tutorService', () => ({
  TutorService: class {
    answerQuestion = answerQuestion;
  },
}));

import TutorController, {
  MAX_QUESTION_LENGTH,
} from '../../controllers/tutorController';

const ask = (question: string) =>
  runHandler(new TutorController().ask as never, {
    body: { question },
    user: { id: 'u1' } as never,
  });

describe('POST /tutor/ask', () => {
  beforeEach(() => {
    answerQuestion.mockClear();
  });

  it('refuses an oversized question before any AI spend', async () => {
    const out = await ask('x'.repeat(MAX_QUESTION_LENGTH + 1));
    expect(out.status).toBe(400);
    expect(answerQuestion).not.toHaveBeenCalled();
  });

  it('answers a question at the limit', async () => {
    const out = await ask('x'.repeat(MAX_QUESTION_LENGTH));
    expect(out.status).toBe(200);
    expect(answerQuestion).toHaveBeenCalledTimes(1);
  });
});
