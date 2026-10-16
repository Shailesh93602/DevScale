'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { useMatchmaking } from '@/hooks/useMatchmaking';
import {
  MatchmakingRadar,
  MatchFoundModal,
} from '@/components/Battle/MatchmakingRadar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, Swords, Trophy, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function InstantBattlePage() {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();
  const {
    phase,
    elapsedSeconds,
    currentBand,
    queueSize,
    userRating,
    matchedBattle,
    error,
    joinQueue,
    leaveQueue,
    reset,
  } = useMatchmaking();

  const handleAcceptMatch = () => {
    if (matchedBattle?.battleId) {
      router.push(`/battle-zone/${matchedBattle.battleId}`);
    } else {
      router.push('/battle-zone');
    }
  };

  const handleDeclineMatch = () => {
    reset();
  };

  return (
    <BattleZoneLayout>
      <div className="container mx-auto max-w-4xl space-y-8 p-4 md:py-8">
        {/* Unauthenticated gate */}
        {!isAuthenticated && status !== 'loading' ? (
          <div className="border-primary/20 flex flex-col items-center justify-center rounded-2xl border bg-card p-10 text-center shadow-lg">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl text-primary">
              <Swords className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Sign In to Enter Ranked Matchmaking
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Instant 1-v-1 battles require an authenticated account to track
              your competitive Elo rating, win rate, and leaderboard standing.
            </p>
            <Link
              href="/auth/login?callbackUrl=/instant-battle"
              className="mt-6"
            >
              <Button
                size="lg"
                className="flex items-center gap-2 rounded-xl font-bold"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In to Play</span>
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Interactive Matchmaking Radar */}
            <MatchmakingRadar
              phase={phase}
              elapsedSeconds={elapsedSeconds}
              currentBand={currentBand}
              queueSize={queueSize}
              userRating={userRating}
              error={error}
              onJoin={joinQueue}
              onLeave={leaveQueue}
              onRetry={joinQueue}
            />

            {/* Match Found Modal */}
            <MatchFoundModal
              isOpen={phase === 'matched'}
              matchedBattle={matchedBattle}
              onAccept={handleAcceptMatch}
              onDecline={handleDeclineMatch}
              countdownSeconds={10}
            />

            {/* Rules & Fair Play Guidance */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card/60 p-5 shadow-sm">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold">Elo Rating Stakes</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Every match recalibrates your rating using standard FIDE Elo.
                  Beat higher-ranked opponents for massive rating boosts.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/60 p-5 shadow-sm">
                <div className="bg-yellow-500/10 text-yellow-500 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold">Rapid 5-Question Blitz</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  30 seconds per question with live score deltas. Speed and
                  accuracy determine the winner in real time.
                </p>
              </div>

              <div className="rounded-xl border border-border/50 bg-card/60 p-5 shadow-sm">
                <div className="bg-green-500/10 text-green-500 flex h-10 w-10 items-center justify-center rounded-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="mt-3 font-bold">Anti-Double Booking</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Distributed locks protect queue entries from race conditions
                  and ensure clean 1-v-1 pairings.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </BattleZoneLayout>
  );
}
