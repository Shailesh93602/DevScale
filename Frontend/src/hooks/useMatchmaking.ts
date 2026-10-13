'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { createClient } from '@/utils/supabase/client';
import { io, Socket } from 'socket.io-client';

export interface MatchResult {
  matched: boolean;
  battleId?: string;
  slug?: string;
  opponentId?: string;
}

export interface MatchmakingStatus {
  inQueue: boolean;
  queueSize: number;
  rating: number | null;
}

export type MatchmakingPhase =
  | 'idle'
  | 'joining'
  | 'queuing'
  | 'matched'
  | 'timeout'
  | 'error';

export interface UseMatchmakingOptions {
  /** Maximum queue duration in milliseconds before falling back to timeout (default: 60,000 ms). */
  timeoutMs?: number;
  /** Status polling interval in milliseconds while queuing (default: 3,000 ms). */
  pollIntervalMs?: number;
  /** Initial rating band expansion base (default: 100). */
  baseBand?: number;
  /** Rate at which band expands per second (default: 20). */
  bandPerSecond?: number;
  /** Max rating band expansion (default: 600). */
  maxBand?: number;
}

export interface UseMatchmakingReturn {
  phase: MatchmakingPhase;
  elapsedSeconds: number;
  currentBand: number;
  queueSize: number;
  userRating: number | null;
  matchedBattle: MatchResult | null;
  error: string | null;
  joinQueue: () => Promise<void>;
  leaveQueue: () => Promise<void>;
  reset: () => void;
}

export function useMatchmaking(
  options: UseMatchmakingOptions = {},
): UseMatchmakingReturn {
  const {
    timeoutMs = 60000,
    pollIntervalMs = 3000,
    baseBand = 100,
    bandPerSecond = 20,
    maxBand = 600,
  } = options;

  const [phase, setPhase] = useState<MatchmakingPhase>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentBand, setCurrentBand] = useState(baseBand);
  const [queueSize, setQueueSize] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [matchedBattle, setMatchedBattle] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [postJoin] = useAxiosPost<MatchResult>('/matchmaking/join');
  const [postLeave] = useAxiosPost<{ left: boolean }>('/matchmaking/leave');
  const [getStatus] = useAxiosGet<MatchmakingStatus>('/matchmaking/status');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Clean up all running timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Connect socket to receive push notifications for matchmaking:matched
  useEffect(() => {
    let isSubscribed = true;

    async function initSocket() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token || !isSubscribed) return;

        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
        const wsUrl =
          process.env.NEXT_PUBLIC_WS_URL ||
          apiBase.replace(/\/api\/v1\/?$/, '') ||
          'http://localhost:5000';

        const socket = io(wsUrl, {
          path: '/socket.io',
          transports: ['websocket'],
          reconnection: true,
          auth: { token },
        });

        socketRef.current = socket;

        socket.on('matchmaking:matched', (data: MatchResult) => {
          if (!isSubscribed) return;
          clearTimers();
          setMatchedBattle(data);
          setPhase('matched');
        });
      } catch {
        // Socket init fallback — polling will still pick up state if socket fails
      }
    }

    void initSocket();

    return () => {
      isSubscribed = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [clearTimers]);

  // Periodic elapsed timer + band expansion calculation
  useEffect(() => {
    if (phase !== 'queuing') return;

    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    setCurrentBand(baseBand);

    timerRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsedSeconds(elapsedSec);

      const expandedBand = Math.min(
        maxBand,
        baseBand + elapsedSec * bandPerSecond,
      );
      setCurrentBand(expandedBand);

      // Check timeout boundary
      if (elapsedMs >= timeoutMs) {
        clearTimers();
        setPhase('timeout');
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, baseBand, bandPerSecond, maxBand, timeoutMs, clearTimers]);

  // Poll status while queuing
  useEffect(() => {
    if (phase !== 'queuing') return;

    const checkStatus = async () => {
      const res = await getStatus();
      if (res.success && res.data) {
        setQueueSize(res.data.queueSize);
        if (res.data.rating !== null) {
          setUserRating(res.data.rating);
        }
        // If we are no longer in queue on the server but didn't receive a match or error,
        // recheck if a match happened
        if (!res.data.inQueue && phase === 'queuing') {
          // May have been matched or expired
        }
      }
    };

    void checkStatus();
    pollTimerRef.current = setInterval(checkStatus, pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [phase, getStatus, pollIntervalMs]);

  // Join matchmaking
  const joinQueue = useCallback(async () => {
    setError(null);
    setPhase('joining');

    const res = await postJoin({});
    if (!res.success) {
      setError(res.message || 'Failed to join matchmaking queue.');
      setPhase('error');
      return;
    }

    // Direct instantaneous match returned inline
    if (res.data?.matched && res.data.battleId) {
      clearTimers();
      setMatchedBattle(res.data);
      setPhase('matched');
      return;
    }

    // Otherwise enqueued and waiting
    setPhase('queuing');
  }, [postJoin, clearTimers]);

  // Leave matchmaking
  const leaveQueue = useCallback(async () => {
    clearTimers();
    await postLeave({});
    setPhase('idle');
    setElapsedSeconds(0);
    setMatchedBattle(null);
  }, [postLeave, clearTimers]);

  // Reset to idle
  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setElapsedSeconds(0);
    setCurrentBand(baseBand);
    setMatchedBattle(null);
    setError(null);
  }, [clearTimers, baseBand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
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
  };
}
