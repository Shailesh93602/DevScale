import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Battle, BattleStatus } from '@/types/battle';
import {
  Clock,
  Calendar,
  Users,
  Timer,
  ChevronRight,
  Swords,
  BarChart,
  Loader2,
  BookOpen,
  HelpCircle,
  Trophy,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleCardProps {
  battle: Battle;
  onJoin?: (battleId: string, status?: BattleStatus) => void;
  onView?: (battleId: string) => void;
  variant?: 'default' | 'compact';
  isLoading?: boolean;
  currentUserId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  LOBBY: 'Lobby',
  IN_PROGRESS: 'Live',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  LOBBY: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  IN_PROGRESS: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  COMPLETED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUS_BAR_COLORS: Record<string, string> = {
  WAITING: 'border-t-blue-500',
  LOBBY: 'border-t-amber-500',
  IN_PROGRESS: 'border-t-emerald-500',
  COMPLETED: 'border-t-muted-foreground',
  CANCELLED: 'border-t-destructive',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'hard':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  topic: 'Topic',
  subject: 'Subject',
  main_concept: 'Concept',
  roadmap: 'Roadmap',
  dsa: 'DSA',
};

const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onJoin,
  onView,
  variant = 'default',
  isLoading = false,
  currentUserId,
}) => {
  const router = useRouter();
  const isCompact = variant === 'compact';
  const [isJoining, setIsJoining] = React.useState(false);

  const isUserJoined = currentUserId
    ? battle.participants.some((p) => p.user_id === currentUserId)
    : false;
  const isFull = battle.current_participants >= battle.max_participants;
  const participantPercent = Math.round(
    (battle.current_participants / battle.max_participants) * 100,
  );
  const battleRef = battle.slug ?? battle.id;

  const handleJoin = async () => {
    if (isJoining) return;
    // If user is already a participant, just navigate — no API call needed
    if (isUserJoined) {
      router.push(`/battle-zone/${battleRef}`);
      return;
    }
    setIsJoining(true);
    if (onJoin) {
      onJoin(battle.id, battle.status);
    }
    setIsJoining(false);
  };

  const handleView = () => {
    if (onView) {
      onView(battle.id);
    } else {
      router.push(`/battle-zone/${battleRef}`);
    }
  };

  const getSourceLabel = () => {
    if (battle.topic?.title) return { label: battle.topic.title, icon: BookOpen };
    if (battle.question_source_type) {
      return {
        label: SOURCE_TYPE_LABELS[battle.question_source_type] ?? battle.question_source_type,
        icon: BookOpen,
      };
    }
    return null;
  };

  const getTimeLabel = () => {
    if (battle.status === 'IN_PROGRESS') {
      return { text: 'Battle is live now', color: 'text-emerald-600' };
    }
    if ((battle.status === 'WAITING' || battle.status === 'LOBBY') && battle.start_time) {
      const start = new Date(battle.start_time);
      const diffMs = start.getTime() - Date.now();
      const isUrgent = diffMs > 0 && diffMs < 3600_000; // < 1 hour
      return {
        text: `Starts ${formatDistanceToNow(start, { addSuffix: true })}`,
        color: isUrgent ? 'text-amber-600' : 'text-muted-foreground',
      };
    }
    if (battle.status === 'COMPLETED') {
      return { text: 'Battle ended', color: 'text-muted-foreground' };
    }
    return null;
  };

  const renderPrimaryButton = () => {
    const commonDisabled = isJoining;

    if (isUserJoined) {
      return (
        <Button className="flex-1" onClick={handleJoin} disabled={commonDisabled}>
          {battle.status === 'IN_PROGRESS' ? (
            <><Play className="mr-2 h-4 w-4" /> Resume Battle</>
          ) : (
            <><Swords className="mr-2 h-4 w-4" /> Enter Battle</>
          )}
        </Button>
      );
    }

    if (battle.status === 'WAITING' || battle.status === 'LOBBY') {
      if (isFull) {
        return (
          <Button className="flex-1" variant="outline" disabled>
            <Users className="mr-2 h-4 w-4" /> Battle Full
          </Button>
        );
      }
      return (
        <Button className="flex-1" onClick={handleJoin} disabled={commonDisabled}>
          {isJoining ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
          ) : (
            <><Swords className="mr-2 h-4 w-4" /> Join Battle</>
          )}
        </Button>
      );
    }

    if (battle.status === 'IN_PROGRESS') {
      return (
        <Button className="flex-1" variant="outline" onClick={handleView}>
          <Play className="mr-2 h-4 w-4" /> Watch Live
        </Button>
      );
    }

    if (battle.status === 'COMPLETED') {
      return (
        <Button className="flex-1" variant="outline" onClick={handleView}>
          <Trophy className="mr-2 h-4 w-4" /> View Results
        </Button>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="animate-pulse">
          <div className="h-1 bg-muted" />
          <div className="space-y-3 p-5">
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-12 rounded-full bg-muted" />
            </div>
            <div className="h-6 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-2 w-full rounded-full bg-muted" />
          </div>
          <div className="flex gap-2 px-5 pb-5">
            <div className="h-9 flex-1 rounded bg-muted" />
            <div className="h-9 w-28 rounded bg-muted" />
          </div>
        </div>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card
        className={cn(
          'w-full overflow-hidden border-l-4 transition-all hover:shadow-md',
          STATUS_BAR_COLORS[battle.status]?.replace('border-t', 'border-l') ??
            'border-l-muted-foreground',
        )}
      >
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-xs', STATUS_COLORS[battle.status])}>
                {STATUS_LABELS[battle.status] ?? battle.status}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', getDifficultyColor(battle.difficulty))}>
                {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
              </Badge>
            </div>
            <h3 className="font-semibold truncate">{battle.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
          <Button variant="ghost" size="sm" onClick={handleView} aria-label="View battle details">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  const source = getSourceLabel();
  const timeLabel = getTimeLabel();

  return (
    <Card
      className={cn(
        'group w-full overflow-hidden border-t-2 transition-all duration-200 hover:shadow-lg',
        STATUS_BAR_COLORS[battle.status] ?? 'border-t-muted-foreground',
      )}
    >
      <CardHeader className="pb-3 pt-4">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                'font-medium',
                STATUS_COLORS[battle.status],
                battle.status === 'WAITING' && 'animate-pulse',
              )}
            >
              {STATUS_LABELS[battle.status] ?? battle.status}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 capitalize text-xs">
              {battle.type === 'QUICK' && <Timer className="h-3 w-3" />}
              {battle.type === 'SCHEDULED' && <Calendar className="h-3 w-3" />}
              {battle.type === 'PRACTICE' && <BarChart className="h-3 w-3" />}
              {battle.type.toLowerCase()}
            </Badge>
            {isUserJoined && (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Joined
              </Badge>
            )}
          </div>
          <Badge className={cn('shrink-0 text-xs font-medium', getDifficultyColor(battle.difficulty))}>
            {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {battle.title}
        </h3>

        {/* Description */}
        {battle.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {battle.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3 space-y-3">
        {/* Key stats row */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{battle.total_questions}</span>
            <span>questions</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Timer className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{battle.time_per_question}s</span>
            <span>each</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">{battle.points_per_question}</span>
            <span>pts</span>
          </div>
        </div>

        {/* Source */}
        {source && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <source.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{source.label}</span>
          </div>
        )}

        {/* Time label */}
        {timeLabel && (
          <div className={cn('flex items-center gap-1.5 text-sm font-medium', timeLabel.color)}>
            <Clock className="h-4 w-4 shrink-0" />
            <span>{timeLabel.text}</span>
          </div>
        )}

        {/* Participant progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                <span className="font-semibold text-foreground">{battle.current_participants}</span>
                <span> / {battle.max_participants} players</span>
              </span>
            </div>
            {isFull && (
              <span className="text-xs text-amber-600 font-medium">Full</span>
            )}
          </div>
          <Progress value={participantPercent} className="h-1.5" />
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 pt-0.5">
          <Avatar className="h-5 w-5">
            <AvatarImage
              src={battle.creator.avatar_url ?? undefined}
              alt={battle.creator.username}
            />
            <AvatarFallback className="text-[10px]">
              {battle.creator.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            by <span className="font-medium text-foreground">{battle.creator.username}</span>
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex gap-2">
        {renderPrimaryButton()}
        <Button variant="ghost" size="sm" onClick={handleView} className="shrink-0">
          Details
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BattleCard;
