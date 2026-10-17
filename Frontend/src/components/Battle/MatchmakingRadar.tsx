'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MatchmakingPhase, MatchResult } from '@/hooks/useMatchmaking';

interface MatchmakingRadarProps {
  phase: MatchmakingPhase;
  elapsedSeconds: number;
  queueSize: number;
  userRating: number | null;
  error: string | null;
  onJoin: () => void;
  onLeave: () => void;
  onRetry: () => void;
}

export const MatchmakingRadar: React.FC<MatchmakingRadarProps> = ({
  phase,
  elapsedSeconds,
  queueSize,
  userRating,
  error,
  onJoin,
  onLeave,
  onRetry,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-xl md:p-8">
      {/* Background ambient radar glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {phase === 'idle' && (
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Skill-Based Elo Matchmaking</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight md:text-3xl">
              1-on-1 Instant Ranked Duel
            </h3>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">
              Enter the competitive queue. When you join, we pair you with a
              waiting player within ±100 Elo of your rating, if there is one.
            </p>
          </div>

          <Button
            size="lg"
            onClick={onJoin}
            className="group flex h-14 items-center gap-3 rounded-xl px-8 text-base font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 active:scale-[0.98]"
          >
            <Swords className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span>Find Instant Match</span>
          </Button>
        </div>
      )}

      {phase === 'joining' && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-base font-semibold">
            Contacting Matchmaking Engine...
          </p>
          <p className="text-xs text-muted-foreground">
            Verifying Elo rating and reserving ticket
          </p>
        </div>
      )}

      {phase === 'queuing' && (
        <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
          {/* Animated radar circle */}
          <div className="relative flex h-36 w-36 items-center justify-center">
            {/* Radar wave pulses */}
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border border-primary/50 bg-primary/10"
            />
            <motion.div
              animate={{ scale: [1, 2.3], opacity: [0.5, 0] }}
              transition={{
                duration: 2,
                delay: 0.7,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 rounded-full border border-primary/30 bg-primary/5"
            />

            {/* Center icon */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-background shadow-lg">
              <Compass className="h-9 w-9 animate-spin text-primary [animation-duration:8s]" />
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xl font-bold tracking-tight">
              Searching for Opponent...
            </h4>
            <div className="flex items-center justify-center gap-2 font-mono text-2xl font-black tabular-nums text-primary">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          {/* Rating & queue stats badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1 text-xs"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Your Elo: <strong>{userRating ?? 'Unrated (~1200)'}</strong>
              </span>
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1.5 px-3 py-1 text-xs"
            >
              <Users className="text-blue-500 h-3.5 w-3.5" />
              <span>
                In Queue: <strong>{queueSize}</strong>
              </span>
            </Badge>
          </div>

          <p className="max-w-md text-xs text-muted-foreground">
            Matching runs when you join: if nobody within ±100 Elo is waiting,
            you stay queued until a player in range joins.
          </p>

          <Button
            variant="destructive"
            onClick={onLeave}
            className="flex items-center gap-2 rounded-xl text-sm font-semibold"
          >
            <X className="h-4 w-4" />
            <span>Cancel Queue</span>
          </Button>
        </div>
      )}

      {phase === 'timeout' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-bold">No Opponent Found in Range</h4>
            <p className="max-w-md text-sm text-muted-foreground">
              We couldn&apos;t find an opponent within the 60-second window. You
              can re-enter the queue or create a custom battle room to invite
              friends directly.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button onClick={onRetry} className="rounded-xl font-semibold">
              Search Again
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/battle-zone/create';
                }
              }}
              className="rounded-xl font-semibold"
            >
              Create Battle Room
            </Button>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-bold">Matchmaking Error</h4>
            <p className="max-w-md text-sm text-destructive">
              {error || 'Failed to connect to matchmaking server.'}
            </p>
          </div>
          <Button
            onClick={onRetry}
            variant="outline"
            className="rounded-xl font-semibold"
          >
            Retry Connection
          </Button>
        </div>
      )}
    </div>
  );
};

interface MatchFoundModalProps {
  isOpen: boolean;
  matchedBattle: MatchResult | null;
  onAccept: () => void;
  onDecline: () => void;
  countdownSeconds?: number;
}

export const MatchFoundModal: React.FC<MatchFoundModalProps> = ({
  isOpen,
  matchedBattle,
  onAccept,
  onDecline,
  countdownSeconds = 10,
}) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(countdownSeconds);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-accept and route into battle on timer expiry
          onAccept();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds, onAccept]);

  if (!isOpen || !matchedBattle) return null;

  const progressPct = (timeLeft / countdownSeconds) * 100;
  const battleDestination = matchedBattle.battleId
    ? `/battle-zone/${matchedBattle.battleId}`
    : '/battle-zone';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl md:p-8"
        >
          <div className="flex flex-col items-center text-center">
            {/* Visual match badge */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary shadow-inner">
              <Swords className="h-8 w-8 animate-bounce" />
            </div>

            <h3 className="mt-4 text-2xl font-black tracking-tight">
              Match Found!
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              An opponent has accepted the challenge. Prepare for ranked duel.
            </p>

            {/* Countdown timer */}
            <div className="my-6 w-full space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Entering Battle in:
                </span>
                <span className="font-mono font-bold text-primary">
                  {timeLeft}s
                </span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>

            {/* Call to action buttons */}
            <div className="flex w-full flex-col gap-2.5">
              <Button
                size="lg"
                onClick={() => {
                  onAccept();
                  router.push(battleDestination);
                }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold shadow-md shadow-primary/20"
              >
                <span>Enter Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDecline}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Decline Match
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
