import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Battle, BattleStatus } from '@/types/battle';
import {
  BarChart,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DIFFICULTY_LABELS,
  STATUS_BAR_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  battleSourceLabel,
  getDifficultyColor,
} from './battle-card/battleCardStyles';
import { BattleCardSkeleton } from './battle-card/BattleCardSkeleton';
import { useBattleTimeLabel } from './battle-card/useBattleTimeLabel';
import {
  BattleStatsRow,
  CompactBattleCard,
  CreatorLine,
  ParticipantProgress,
  PrimaryAction,
} from './battle-card/BattleCardParts';

export { BattleCardSkeleton };

interface BattleCardProps {
  battle: Battle;
  onJoin?: (battleId: string, status?: BattleStatus) => void;
  onView?: (battleId: string) => void;
  variant?: 'default' | 'compact';
  isLoading?: boolean;
  currentUserId?: string;
}

function CardBadges({
  battle,
  isUserJoined,
}: {
  battle: Battle;
  isUserJoined: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={cn(
            'font-medium',
            STATUS_COLORS[battle.status],
            battle.status === 'WAITING' && 'animate-pulse',
          )}
        >
          {STATUS_LABELS[battle.status] ?? battle.status}
        </Badge>
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-xs capitalize"
        >
          {battle.type === 'QUICK' && <Timer className="h-3 w-3" />}
          {battle.type === 'SCHEDULED' && <Calendar className="h-3 w-3" />}
          {battle.type === 'PRACTICE' && <BarChart className="h-3 w-3" />}
          {battle.type.toLowerCase()}
        </Badge>
        {isUserJoined && (
          <Badge className="border-primary/20 bg-primary/10 text-xs text-primary">
            Joined
          </Badge>
        )}
      </div>
      <Badge
        className={cn(
          'shrink-0 text-xs font-medium',
          getDifficultyColor(battle.difficulty),
        )}
      >
        {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
      </Badge>
    </div>
  );
}

const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onJoin,
  onView,
  variant = 'default',
  isLoading = false,
  currentUserId,
}) => {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const timeLabel = useBattleTimeLabel(battle);

  if (isLoading) {
    return <BattleCardSkeleton variant={variant} />;
  }

  const isUserJoined = currentUserId
    ? battle.participants.some((p) => p.user_id === currentUserId)
    : false;
  const isFull = battle.current_participants >= battle.max_participants;
  const battleRef = battle.slug ?? battle.id;

  const handleJoin = async () => {
    if (isJoining) return;
    // Already a participant: just navigate, no API call needed
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

  if (variant === 'compact') {
    return <CompactBattleCard battle={battle} onView={handleView} />;
  }

  const source = battleSourceLabel(battle);

  return (
    <Card
      className={cn(
        'group w-full overflow-hidden border-t-2 transition-all duration-200 hover:shadow-lg',
        STATUS_BAR_COLORS[battle.status] ?? 'border-t-muted-foreground',
      )}
    >
      <CardHeader className="pb-3 pt-4">
        <CardBadges battle={battle} isUserJoined={isUserJoined} />

        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-tight transition-colors group-hover:text-primary">
          {battle.title}
        </h3>

        {battle.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {battle.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <BattleStatsRow battle={battle} />

        {source && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="truncate">{source}</span>
          </div>
        )}

        {timeLabel && (
          <div
            className={cn(
              'flex items-center gap-1.5 text-sm font-medium',
              timeLabel.color,
            )}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>{timeLabel.text}</span>
          </div>
        )}

        <ParticipantProgress battle={battle} isFull={isFull} />
        <CreatorLine creator={battle.creator} />
      </CardContent>

      <CardFooter className="flex gap-2 pb-4 pt-0">
        <PrimaryAction
          battle={battle}
          isUserJoined={isUserJoined}
          isFull={isFull}
          isJoining={isJoining}
          onJoin={handleJoin}
          onView={handleView}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          className="shrink-0"
        >
          Details
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BattleCard;
