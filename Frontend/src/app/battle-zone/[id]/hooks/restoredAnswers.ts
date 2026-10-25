import type { AnswerResult } from '@/types/battle';
import type { BattleEventMap } from '@/hooks/useBattleWebSocket';

export type RestoredAnswer =
  BattleEventMap['battle:state']['my_answers'][number];
export type RestoredAnswers = Record<string, RestoredAnswer>;

/** Index the replayed answers by question id (missing on an older server). */
export function indexRestoredAnswers(
  answers: RestoredAnswer[] | undefined,
): RestoredAnswers {
  return Object.fromEntries((answers ?? []).map((a) => [a.question_id, a]));
}

/** What the question panel should show for a question answered before a reload. */
export function restoredResult(
  restored: RestoredAnswers,
  questionId: string | undefined,
): { selectedOption: number; result: AnswerResult } | null {
  const a = questionId ? restored[questionId] : undefined;
  if (!a) return null;
  return {
    selectedOption: a.selected_option,
    result: {
      is_correct: a.is_correct,
      points_earned: a.points_earned,
      correct_answer: a.correct_answer,
      explanation: a.explanation,
    },
  };
}
