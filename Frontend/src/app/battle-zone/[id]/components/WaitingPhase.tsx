import { Clock, Crown, Play, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatBattleDate } from './battleDisplay';
import {
  ActionIcon,
  LoadedBattleState,
  QuestionsMissingNotice,
  UserAvatar,
  questionProgress,
} from './shared';

function WaitingActions({ s }: { s: LoadedBattleState }) {
  const { battle, isParticipant, isCreator, actionLoading } = s;
  return (
    <div className="flex gap-3">
      {!isParticipant ? (
        <Button
          className="flex-1"
          size="lg"
          onClick={s.handleJoin}
          disabled={actionLoading}
        >
          <ActionIcon loading={actionLoading} icon={Swords} />
          Join Battle
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={s.handleLeave}
          disabled={actionLoading}
        >
          Leave
        </Button>
      )}
      {isCreator && isParticipant && battle.current_participants >= 2 && (
        <Button size="sm" onClick={s.handleOpenLobby} disabled={actionLoading}>
          <ActionIcon loading={actionLoading} icon={Play} />
          Open Lobby
        </Button>
      )}
      {isCreator && isParticipant && (
        <Button
          variant="destructive"
          size="sm"
          onClick={s.handleCancelBattle}
          disabled={actionLoading}
        >
          Cancel Battle
        </Button>
      )}
    </div>
  );
}

function WaitingParticipants({ s }: { s: LoadedBattleState }) {
  const { battle, userId } = s;
  return (
    <div className="space-y-3 rounded-xl border bg-card p-6">
      <h3 className="font-semibold">
        Participants ({battle.current_participants})
      </h3>
      {battle.participants.map((p) => (
        <div key={p.user_id} className="flex items-center gap-3">
          <UserAvatar
            username={p.user.username}
            avatarUrl={p.user.avatar_url}
          />
          <span className="font-medium">{p.user.username}</span>
          {p.user_id === battle.user_id && (
            <Badge variant="secondary" className="text-xs">
              <Crown className="mr-1 h-3 w-3" />
              Creator
            </Badge>
          )}
          {p.user_id === userId && (
            <Badge variant="outline" className="ml-auto text-xs">
              You
            </Badge>
          )}
        </div>
      ))}
      {battle.participants.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No one has joined yet. Be the first!
        </p>
      )}
    </div>
  );
}

export function WaitingPhase({ s }: { s: LoadedBattleState }) {
  const { battle, isCreator } = s;
  const { questionCount, questionsReady } = questionProgress(battle);
  return (
    <div className="space-y-6">
      {isCreator && !questionsReady && (
        <QuestionsMissingNotice title="Questions needed before starting">
          This battle has {questionCount} of {battle.total_questions} questions
          added. Players joined to the lobby cannot start until all questions
          are ready. Go back and add questions via the battle creation flow, or
          use the API.
        </QuestionsMissingNotice>
      )}
      <div className="space-y-4 rounded-xl border bg-card p-6 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-bold">Waiting for players</h2>
          <p className="mt-1 text-muted-foreground">
            {battle.current_participants} / {battle.max_participants} players
            joined
          </p>
        </div>
        {battle.start_time && (
          <p className="text-sm text-muted-foreground">
            Scheduled: {formatBattleDate(battle.start_time)}
          </p>
        )}
        <Progress
          value={(battle.current_participants / battle.max_participants) * 100}
          className="h-2"
        />
      </div>

      <WaitingParticipants s={s} />
      <WaitingActions s={s} />
    </div>
  );
}
