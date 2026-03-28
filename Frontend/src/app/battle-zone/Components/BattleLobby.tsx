import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBattleSocket } from '@/hooks/useBattleWebSocket';
import { Battle, BattleStatus } from '@/types/battle';
import {
  Users,
  MessageSquare,
  Info,
  Play,
  AlertCircle,
  ArrowLeft,
  Share2,
  Loader2,
  Wifi,
  WifiOff,
  Clock,
  Trophy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

// Import custom components
import BattleInformation from './BattleInformation';
import LobbyParticipantList from './LobbyParticipantList';
import BattleChat from './BattleChat';
import CountdownTimer from './CountdownTimer';
import BattleRules from './BattleRules';

interface BattleLobbyProps {
  battle: Battle;
  currentUserId: string;
  onStartBattle?: () => void;
  onLeaveBattle?: () => void;
}

const BattleLobby: React.FC<BattleLobbyProps> = ({
  battle,
  currentUserId,
  onStartBattle,
  onLeaveBattle,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [allParticipantsReady, setAllParticipantsReady] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [canStartNow, setCanStartNow] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);
  const [wsStatus, setWsStatus] = useState<BattleStatus | null>(null);

  const { isConnected, on } = useBattleSocket(battle.id);

  // Listen for status changes
  useEffect(() => {
    return on('battle:status_changed', ({ status }) => {
      setWsStatus(status as BattleStatus);
    });
  }, [on]);

  // Check if current user is the creator
  useEffect(() => {
    setIsCreator(battle.creator.id === currentUserId);
  }, [battle.creator.id, currentUserId]);

  useEffect(() => {
    if (isConnected) {
      setHasConnectedOnce(true);
    }
  }, [isConnected]);

  useEffect(() => {
    setCanStartNow(
      isCreator &&
        allParticipantsReady &&
        (battle.status === 'WAITING' || battle.status === 'LOBBY') &&
        battle.current_participants >= 2,
    );
  }, [
    isCreator,
    allParticipantsReady,
    battle.status,
    battle.current_participants,
  ]);

  const onStartBattleRef = useRef(onStartBattle);
  onStartBattleRef.current = onStartBattle;

  useEffect(() => {
    if (wsStatus === 'IN_PROGRESS') {
      toast({
        title: 'Battle Started',
        description: 'The battle has begun! Get ready to compete!',
      });

      if (onStartBattleRef.current) {
        onStartBattleRef.current();
      }
    }
  }, [wsStatus, toast]);

  const handleStartBattle = async () => {
    if (!canStartNow || isStarting) return;

    setIsStarting(true);
    try {
      toast({
        title: 'Starting Battle',
        description: 'The battle is about to begin...',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to start battle. Please try again.',
        variant: 'destructive',
      });
      setIsStarting(false);
    }
  };

  const handleLeaveBattle = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      if (onLeaveBattle) {
        await onLeaveBattle();
      }
      toast({
        title: 'Left Battle',
        description: 'You have left the battle lobby.',
      });
      router.push('/battle-zone');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to leave battle. Please try again.',
        variant: 'destructive',
      });
      setIsLeaving(false);
    }
  };

  const handleShareBattle = () => {
    const battleUrl = `${window.location.origin}/battle-zone/${battle.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: `Join my battle: ${battle.title}`,
          text: `Join my coding battle on ${battle.topic?.title ?? battle.title}!`,
          url: battleUrl,
        })
        .catch(() => {
          copyToClipboard(battleUrl);
        });
    } else {
      copyToClipboard(battleUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'Battle link copied to clipboard!',
          variant: 'default',
        });
      },
      () => {
        toast({ title: 'Failed to copy battle link', variant: 'destructive' });
      },
    );
  };

  const startTime = battle.start_time ? new Date(battle.start_time) : null;
  const timeLeft = startTime ? formatDistanceToNow(startTime) : '';

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {battle.title}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Waiting for participants to join and get ready
            </p>
          </div>
          <Badge
            variant={
              isConnected
                ? 'default'
                : hasConnectedOnce
                  ? 'destructive'
                  : 'secondary'
            }
            className="animate-pulse"
          >
            {isConnected ? (
              <Wifi className="mr-2 h-4 w-4" />
            ) : (
              <WifiOff className="mr-2 h-4 w-4" />
            )}
            {isConnected
              ? 'Connected'
              : hasConnectedOnce
                ? 'Reconnecting...'
                : 'Connecting...'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveBattle}
            disabled={isLeaving || isStarting}
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {isLeaving ? 'Leaving...' : 'Leave'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShareBattle}
            disabled={isLeaving || isStarting}
            className="group"
          >
            <Share2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
            Share
          </Button>

          {isCreator && (
            <Button
              size="sm"
              onClick={handleStartBattle}
              disabled={!canStartNow || isStarting || isLeaving}
              className={cn(
                'group transition-all duration-300',
                canStartNow && 'hover:scale-105',
              )}
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  Start Now
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Battle status alert */}
      <AnimatePresence>
        {(battle.status === 'WAITING' || battle.status === 'LOBBY') && (
          <motion.div
            initial={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Waiting for battle to start</AlertTitle>
              <AlertDescription>
                The battle will start automatically at the scheduled time, or
                the creator can start it early once all participants are ready.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {/* Left column */}
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="participants">
            <TabsList className="w-full">
              <TabsTrigger value="participants" className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Participants
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1">
                <Info className="mr-2 h-4 w-4" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="mt-6">
              <LobbyParticipantList
                battleId={battle.id}
                maxParticipants={battle.max_participants}
                currentUserId={currentUserId}
                creatorId={battle.creator.id}
                onAllReady={setAllParticipantsReady}
              />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <BattleChat
                battleId={battle.id}
                currentUserId={currentUserId}
                maxHeight="400px"
              />
            </TabsContent>

            <TabsContent value="info" className="mt-6">
              <BattleInformation battle={battle} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {battle.start_time && (
            <CountdownTimer
              targetTime={battle.start_time}
              title="Battle starts in"
              size="md"
              onComplete={() => {
                toast({ title: 'Battle is starting!', variant: 'default' });
                if (onStartBattle) onStartBattle();
              }}
            />
          )}

          <BattleRules battle={battle} />
        </div>
      </motion.div>

      {/* Battle Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{battle.title}</CardTitle>
              <CardDescription>{battle.description}</CardDescription>
            </div>
            <Badge
              variant={
                battle.status === 'WAITING' || battle.status === 'LOBBY'
                  ? 'default'
                  : battle.status === 'IN_PROGRESS'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {battle.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {battle.current_participants}/{battle.max_participants}{' '}
                Participants
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{timeLeft}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{battle.points_per_question ?? 0} points per question</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span>{battle.difficulty}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>
            {battle.current_participants} of {battle.max_participants} spots
            filled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress
              value={
                (battle.current_participants / battle.max_participants) * 100
              }
              className="h-2"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {battle.participants?.map((participant) => (
                <div
                  key={participant.user_id}
                  className="flex items-center space-x-4 rounded-lg border p-4"
                >
                  <Avatar>
                    <AvatarImage
                      src={participant.user.avatar_url ?? undefined}
                    />
                    <AvatarFallback>
                      {participant.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {participant.user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.status === 'READY' ? 'Ready' : 'Not Ready'}
                    </p>
                  </div>
                  {participant.user_id === battle.creator.id && (
                    <Badge variant="secondary">Creator</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={handleLeaveBattle}
          disabled={isStarting || isLeaving}
        >
          {isLeaving ? 'Leaving Battle...' : 'Leave Battle'}
        </Button>
        {isCreator && (
          <Button
            onClick={handleStartBattle}
            disabled={!canStartNow || isStarting}
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              'Start Battle'
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default BattleLobby;
