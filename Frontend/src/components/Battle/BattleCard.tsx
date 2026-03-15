import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Battle, BattleStatus } from '@/types/battle';
import {
  Clock,
  Calendar,
  Users,
  Award,
  BarChart,
  Timer,
  ChevronRight,
  Swords,
  Trophy,
  Loader2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BattleCardProps {
  battle: Battle;
  onJoin?: (battleId: string, status?: BattleStatus) => void;
  onView?: (battleId: string) => void;
  variant?: 'default' | 'compact';
  isLoading?: boolean;
}

const getStatusColor = (status: BattleStatus) => {
  switch (status) {
    case 'UPCOMING':
      return 'bg-blue/10 text-blue';
    case 'IN_PROGRESS':
      return 'bg-green/10 text-green';
    case 'completed':
      return 'bg-muted text-muted-foreground';
    case 'cancelled':
      return 'bg-red/10 text-red';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green/10 text-green';
    case 'medium':
      return 'bg-yellow/10 text-yellow';
    case 'hard':
      return 'bg-red/10 text-red';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  onJoin,
  onView,
  variant = 'default',
  isLoading = false,
}) => {
  const router = useRouter();
  const isCompact = variant === 'compact';
  const [isJoining, setIsJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState<string | null>(null);

  const handleJoin = async () => {
    if (onJoin && !isJoining) {
      setIsJoining(true);
      setJoinError(null);
      try {
        await onJoin(battle.id, battle.status);
      } catch (err) {
        setJoinError(
          err instanceof Error ? err.message : 'Failed to join battle',
        );
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleView = () => {
    if (onView) {
      onView(battle.id);
    } else {
      router.push(`/battle-zone/${battle.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const getTimeUntilStart = (startTime: string) => {
    const start = new Date(startTime);
    return formatDistanceToNow(start, { addSuffix: true });
  };

  const renderBattleTypeIcon = () => {
    switch (battle.type) {
      case 'INSTANT':
        return <Timer className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      case 'TOURNAMENT':
        return <Trophy className="h-4 w-4" />;
      case 'PRACTICE':
        return <BarChart className="h-4 w-4" />;
      default:
        return <Swords className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden">
        <div className="animate-pulse">
          <div className="h-32 bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className="w-full overflow-hidden transition-all hover:shadow-md">
        <div className="flex items-start p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={getStatusColor(battle.status)}>
                      {battle.status}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Battle Status: {battle.status}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className={getDifficultyColor(battle.difficulty)}>
                      {battle.difficulty}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Difficulty Level: {battle.difficulty}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{battle.title}</h3>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <Users className="mr-1 h-4 w-4" />
              {battle.currentParticipants}/{battle.maxParticipants} participants
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            aria-label="View battle details"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className={getStatusColor(battle.status)}>
                    {battle.status}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Battle Status: {battle.status}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="flex items-center gap-1">
              {renderBattleTypeIcon()}
              {battle.type}
            </Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={getDifficultyColor(battle.difficulty)}>
                  {battle.difficulty}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Difficulty Level: {battle.difficulty}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardTitle className="mt-2">{battle.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {battle.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>Topic: {battle.topic.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Starts: {formatDate(battle.startDate)} at{' '}
              {formatTime(battle.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{getTimeUntilStart(battle.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {battle.currentParticipants}/{battle.maxParticipants} participants
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={battle.user.avatar_url}
                alt={battle.user.username}
              />
              <AvatarFallback>
                {battle.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              Created by {battle.user.username}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {battle.status === 'UPCOMING' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleJoin}
            disabled={isJoining}
            className={cn(
              'min-w-[100px]',
              isJoining && 'cursor-not-allowed opacity-70',
            )}
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Battle'
            )}
          </Button>
        )}
        {battle.status === 'IN_PROGRESS' && (
          <Button
            variant="default"
            size="sm"
            onClick={handleJoin}
            disabled={isJoining}
            className={cn(
              'min-w-[100px]',
              isJoining && 'cursor-not-allowed opacity-70',
            )}
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entering...
              </>
            ) : (
              'Enter Battle'
            )}
          </Button>
        )}
        {battle.status === 'completed' && (
          <Button variant="outline" size="sm" onClick={handleView}>
            View Results
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleView}
          aria-label="View battle details"
        >
          View Details
        </Button>
      </CardFooter>
      {joinError && (
        <div className="px-4 pb-2 text-sm text-destructive">{joinError}</div>
      )}
    </Card>
  );
};

export default BattleCard;
