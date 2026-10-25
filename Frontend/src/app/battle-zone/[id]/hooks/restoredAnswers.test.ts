import { describe, expect, it } from 'vitest';
import { indexRestoredAnswers, restoredResult } from './restoredAnswers';

const answer = {
  question_id: 'q2',
  selected_option: 3,
  is_correct: false,
  points_earned: 0,
  correct_answer: 1,
  explanation: 'because',
};

describe('answers replayed after a reload', () => {
  it('shows the recorded pick and verdict for a question answered before the reload', () => {
    const restored = indexRestoredAnswers([answer]);
    expect(restoredResult(restored, 'q2')).toEqual({
      selectedOption: 3,
      result: {
        is_correct: false,
        points_earned: 0,
        correct_answer: 1,
        explanation: 'because',
      },
    });
  });

  it('leaves an unanswered question open', () => {
    const restored = indexRestoredAnswers([answer]);
    expect(restoredResult(restored, 'q3')).toBeNull();
    expect(restoredResult(restored, undefined)).toBeNull();
  });

  it('accepts a payload from a server that does not send my_answers', () => {
    expect(indexRestoredAnswers(undefined)).toEqual({});
  });
});
