import type { ComponentProps, ComponentType, ReactNode } from 'react';
import {
  ChevronRight,
  HelpCircle,
  Loader2,
  Play,
  Swords,
  Timer,
  Trophy,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import type { Battle } from '@/types/battle';
import { cn } from '@/lib/utils';
import {
  DIFFICULTY_LABELS,
  STATUS_BAR_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  getDifficultyColor,
} from './battleCardStyles';

interface PrimaryActionProps {
  battle: Battle;
  isUserJoined: boolean;
  isFull: boolean;
  isJoining: boolean;
  onJoin: () => void;
  onView: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  ...props
}: {
  icon: ComponentType<{ className?: string }>;
  label: ReactNode;
} & ComponentProps<typeof Button>) {
  return (
    <Button className="flex-1" {...props}>
      <Icon className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}

/** Join / enter / watch / results, depending on status and whether the viewer is in. */
export function PrimaryAction({
  battle,
  isUserJoined,
  isFull,
  isJoining,
  onJoin,
  onView,
}: PrimaryActionProps) {
  if (isUserJoined) {
    return battle.status === 'IN_PROGRESS' ? (
      <ActionButton
        icon={Play}
        label="Resume Battle"
        onClick={onJoin}
        disabled={isJoining}
      />
    ) : (
      <ActionButton
        icon={Swords}
        label="Enter Battle"
        onClick={onJoin}
        disabled={isJoining}
      />
    );
  }

  if (battle.status === 'WAITING' || battle.status === 'LOBBY') {
    if (isFull) {
      return (
        <ActionButton
          icon={Users}
          label="Battle Full"
          variant="outline"
          disabled
        />
      );
    }
    return isJoining ? (
      <Button className="flex-1" onClick={onJoin} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
      </Button>
    ) : (
      <ActionButton
        icon={Swords}
        label="Join Battle"
        onClick={onJoin}
        disabled={isJoining}
      />
    );
  }

  if (battle.status === 'IN_PROGRESS') {
    return (
      <ActionButton
        icon={Play}
        label="Watch Live"
        variant="outline"
        onClick={onView}
      />
    );
  }

  if (battle.status === 'COMPLETED') {
    return (
      <ActionButton
        icon={Trophy}
        label="View Results"
        variant="outline"
        onClick={onView}
      />
    );
  }

  return null;
}

export function CompactBattleCard({
  battle,
  onView,
}: {
  battle: Battle;
  onView: () => void;
}) {
  return (
    <Card
      className={cn(
        'w-full overflow-hidden border-l-4 transition-all hover:shadow-md',
        STATUS_BAR_COLORS[battle.status]?.replace('border-t', 'border-l') ??
          'border-l-muted-foreground',
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge className={cn('text-xs', STATUS_COLORS[battle.status])}>
              {STATUS_LABELS[battle.status] ?? battle.status}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-xs', getDifficultyColor(battle.difficulty))}
            >
              {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
            </Badge>
          </div>
          <h3 className="truncate font-semibold">{battle.title}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {battle.current_participants}/{battle.max_participants}
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3 w-3" />
              {battle.total_questions}Q
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          aria-label="View battle details"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function Stat({
  icon: Icon,
  value,
  unit,
}: {
  icon: ComponentType<{ className?: string }>;
  value: ReactNode;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-medium text-foreground">{value}</span>
      <span>{unit}</span>
    </div>
  );
}

export function BattleStatsRow({ battle }: { battle: Battle }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <Stat icon={HelpCircle} value={battle.total_questions} unit="questions" />
      <Stat icon={Timer} value={`${battle.time_per_question}s`} unit="each" />
      <Stat icon={Trophy} value={battle.points_per_question} unit="pts" />
    </div>
  );
}

export function ParticipantProgress({
  battle,
  isFull,
}: {
  battle: Battle;
  isFull: boolean;
}) {
  const participantPercent = Math.round(
    (battle.current_participants / battle.max_participants) * 100,
  );
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            <span className="font-semibold text-foreground">
              {battle.current_participants}
            </span>
            <span> / {battle.max_participants} players</span>
          </span>
        </div>
        {isFull && (
          <span className="text-xs font-medium text-warning">Full</span>
        )}
      </div>
      <Progress
        value={participantPercent}
        className="h-1.5"
        aria-label="Participants joined"
      />
    </div>
  );
}

export function CreatorLine({ creator }: { creator: Battle['creator'] }) {
  return (
    <div className="flex items-center gap-2 pt-0.5">
      <Avatar className="h-5 w-5">
        <AvatarImage
          src={creator.avatar_url ?? undefined}
          alt={creator.username}
        />
        <AvatarFallback className="text-[10px]">
          {creator.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs text-muted-foreground">
        by{' '}
        <span className="font-medium text-foreground">{creator.username}</span>
      </span>
    </div>
  );
}
