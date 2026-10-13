import { CheckCircle2, Crown, Play, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ActionIcon,
  LoadedBattleState,
  QuestionsMissingNotice,
  UserAvatar,
  questionProgress,
} from './shared';

function ReadyWaitingNote() {
  return (
    <div className="bg-green-500/5 border-green-500/20 flex-1 rounded-lg border p-4 text-center">
      <p className="text-green-600 font-medium">
        ✓ You are ready. Waiting for others...
      </p>
    </div>
  );
}

function LobbyActions({
  s,
  readyCount,
}: {
  s: LoadedBattleState;
  readyCount: number;
}) {
  const { battle, isParticipant, isReady, isCreator, allReady, actionLoading } =
    s;
  const { questionCount, questionsReady } = questionProgress(battle);
  const canStart = isCreator && allReady && readyCount >= 2;
  return (
    <div className="flex gap-3">
      {isParticipant && !isReady && (
        <Button
          className="flex-1"
          size="lg"
          onClick={s.handleMarkReady}
          disabled={actionLoading}
        >
          <ActionIcon loading={actionLoading} icon={CheckCircle2} />
          Mark as Ready
        </Button>
      )}
      {canStart && (
        <Button
          className="flex-1"
          size="lg"
          variant="default"
          onClick={s.handleStartBattle}
          disabled={actionLoading || !questionsReady}
          title={
            questionsReady
              ? undefined
              : `Add ${battle.total_questions - questionCount} more question(s) before starting`
          }
        >
          <ActionIcon loading={actionLoading} icon={Play} />
          {questionsReady
            ? 'Start Battle'
            : `Start Battle (${questionCount}/${battle.total_questions} questions)`}
        </Button>
      )}
      {isReady && isCreator && !(allReady && readyCount >= 2) && (
        <ReadyWaitingNote />
      )}
      {isReady && !isCreator && <ReadyWaitingNote />}
    </div>
  );
}

export function LobbyPhase({ s }: { s: LoadedBattleState }) {
  const { battle, isCreator } = s;
  const readyCount = battle.participants.filter(
    (p) => p.status === 'READY',
  ).length;
  const { questionCount, questionsReady } = questionProgress(battle);
  return (
    <div className="space-y-6">
      {isCreator && !questionsReady && (
        <QuestionsMissingNotice title="Cannot start — questions missing">
          {questionCount} of {battle.total_questions} questions added. The Start
          Battle button is disabled until all questions are ready.
        </QuestionsMissingNotice>
      )}
      <div className="bg-yellow-500/5 border-yellow-500/20 space-y-3 rounded-xl border p-6 text-center">
        <Trophy className="text-yellow-500 mx-auto h-10 w-10" />
        <h2 className="text-xl font-bold">Lobby — Get Ready!</h2>
        <p className="text-muted-foreground">
          {readyCount} / {battle.participants.length} players ready
        </p>
        <Progress
          value={(readyCount / Math.max(battle.participants.length, 1)) * 100}
          className="h-2"
        />
      </div>

      {/* Participant ready status */}
      <div className="space-y-3 rounded-xl border bg-card p-6">
        {battle.participants.map((p) => (
          <div key={p.user_id} className="flex items-center gap-3">
            <UserAvatar
              username={p.user.username}
              avatarUrl={p.user.avatar_url}
            />
            <span className="flex-1 font-medium">{p.user.username}</span>
            {p.user_id === battle.user_id && (
              <Crown className="text-yellow-500 h-4 w-4" />
            )}
            <Badge
              variant={p.status === 'READY' ? 'default' : 'outline'}
              className={p.status === 'READY' ? 'bg-green-500 text-white' : ''}
            >
              {p.status === 'READY' ? '✓ Ready' : 'Not ready'}
            </Badge>
          </div>
        ))}
      </div>

      <LobbyActions s={s} readyCount={readyCount} />
    </div>
  );
}
