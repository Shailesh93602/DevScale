import { CheckCircle2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MyBattleResults } from '@/hooks/useBattleApi';
import { OPTION_LETTERS, rankChipClass } from './battleDisplay';
import { LoadedBattleState, UserAvatar } from './shared';

type ResultQuestion = MyBattleResults['questions'][number];

function breakdownOptionClass(q: ResultQuestion, idx: number): string {
  if (idx === q.correct_answer)
    return 'border-green-500/50 bg-green-500/10 text-green-700 font-medium';
  if (idx === q.selected_option && !q.is_correct)
    return 'border-destructive/50 bg-destructive/10 text-destructive';
  return 'border-border bg-muted/30 text-muted-foreground';
}

function BreakdownItem({ q }: { q: ResultQuestion }) {
  return (
    <div
      className={`space-y-3 rounded-lg border p-4 ${q.is_correct ? 'border-green-500/30 bg-green-500/5' : 'border-destructive/30 bg-destructive/5'}`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${q.is_correct ? 'bg-green-500 text-white' : 'bg-destructive text-destructive-foreground'}`}
        >
          {q.is_correct ? '✓' : '✗'}
        </span>
        <p className="text-sm font-medium leading-snug">{q.question_text}</p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 pl-7">
        {q.options.map((opt, idx) => (
          <div
            key={idx}
            className={`rounded-md border px-2.5 py-1.5 text-xs ${breakdownOptionClass(q, idx)}`}
          >
            <span className="mr-1 font-bold">{OPTION_LETTERS[idx]}.</span>
            {opt}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 pl-7 text-xs text-muted-foreground">
        <span>{Math.round(q.time_taken_ms / 1000)}s taken</span>
        <span>{q.points_earned} pts earned</span>
        <span className="ml-auto">
          {q.community_accuracy_pct}% of players answered correctly
        </span>
      </div>
      {q.explanation && (
        <p className="border-t pl-7 pt-2 text-xs text-muted-foreground">
          {q.explanation}
        </p>
      )}
    </div>
  );
}

/** Per-question breakdown (P5.14). */
function QuestionBreakdown({ results }: { results: MyBattleResults }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Question Breakdown</h3>
        <span className="text-sm text-muted-foreground">
          {results.summary.correct_count}/{results.summary.total_questions}{' '}
          correct &nbsp;·&nbsp; avg{' '}
          {Math.round((results.summary.avg_time_ms ?? 0) / 1000)}
          s/question
        </span>
      </div>
      <div className="space-y-3">
        {results.questions.map((q, i) => (
          <BreakdownItem key={i} q={q} />
        ))}
      </div>
    </div>
  );
}

export function CompletedPhase({ s }: { s: LoadedBattleState }) {
  const { leaderboard, userId, myResults } = s;
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl border bg-card p-8 text-center">
        {leaderboard[0]?.user_id === userId ? (
          <>
            <Crown className="text-yellow-500 mx-auto h-14 w-14" />
            <h2 className="text-2xl font-bold">You Won! 🎉</h2>
          </>
        ) : (
          <>
            <CheckCircle2 className="text-green-500 mx-auto h-14 w-12" />
            <h2 className="text-2xl font-bold">Battle Complete!</h2>
          </>
        )}
        <p className="text-muted-foreground">Final results are in.</p>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-6">
        <h3 className="font-semibold">Final Standings</h3>
        {leaderboard.map((entry, i) => (
          <div
            key={entry.user_id}
            className={`flex items-center gap-3 rounded-lg p-3 ${entry.user_id === userId ? 'bg-primary/5 border-primary/20 border' : 'border'}`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankChipClass(i)}`}
            >
              {i + 1}
            </span>
            <UserAvatar
              username={entry.username}
              avatarUrl={entry.avatar_url}
            />
            <span className="flex-1 font-medium">
              {entry.username}
              {entry.user_id === userId && (
                <span className="ml-2 text-xs text-primary">(You)</span>
              )}
            </span>
            <span className="font-bold">{entry.score} pts</span>
          </div>
        ))}
      </div>

      {myResults && myResults.questions.length > 0 && (
        <QuestionBreakdown results={myResults} />
      )}

      <Button className="w-full" onClick={() => s.router.push('/battle-zone')}>
        Back to Battle Zone
      </Button>
    </div>
  );
}
