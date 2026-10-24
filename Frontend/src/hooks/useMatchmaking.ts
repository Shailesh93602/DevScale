'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAxiosGet, useAxiosPost } from '@/hooks/useAxios';
import { createClient } from '@/utils/supabase/client';
import { io, Socket } from 'socket.io-client';
import { socketBaseUrl } from '@/lib/realtime-host';

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
  // Read by unmount cleanup and reset(), which must not depend on `phase`.
  const phaseRef = useRef<MatchmakingPhase>('idle');
  const postLeaveRef = useRef(postLeave);
  const unmountedRef = useRef(false);
  useEffect(() => {
    phaseRef.current = phase;
    postLeaveRef.current = postLeave;
  }, [phase, postLeave]);

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

  // Connect socket to receive push notifications for matchmaking:matched.
  // The session may not exist yet on mount, so connect again when it arrives:
  // this socket is the only way the waiting player hears about a match.
  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeAuth: (() => void) | undefined;

    function connect(token: string | undefined) {
      try {
        if (!token || !isSubscribed || socketRef.current) return;

        const socket = io(socketBaseUrl(), {
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

    try {
      const supabase = createClient();
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => connect(session?.access_token))
        .catch(() => {});
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) =>
        connect(session?.access_token),
      );
      unsubscribeAuth = () => subscription.unsubscribe();
    } catch {
      // No auth client — matchmaking still works through the inline join result.
    }

    return () => {
      isSubscribed = false;
      unsubscribeAuth?.();
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
        // The server queue has no TTL: leave it, or a later pairing puts this
        // user in a battle they are no longer watching.
        void postLeaveRef.current({});
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
    // Unmounted mid-join: the cleanup's leave may have reached the server
    // before this join did, so leave again now that the join has landed.
    if (unmountedRef.current) {
      if (res.success && !res.data?.matched) void postLeaveRef.current({});
      return;
    }
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
    const res = await postLeave({});
    if (!res.success) {
      setError(res.message || 'Failed to leave the matchmaking queue.');
      setPhase('error');
      return;
    }
    setPhase('idle');
    setElapsedSeconds(0);
    setMatchedBattle(null);
  }, [postLeave, clearTimers]);

  // Reset to idle
  const reset = useCallback(() => {
    clearTimers();
    if (['joining', 'queuing', 'timeout'].includes(phaseRef.current)) {
      void postLeaveRef.current({});
    }
    setPhase('idle');
    setElapsedSeconds(0);
    setCurrentBand(baseBand);
    setMatchedBattle(null);
    setError(null);
  }, [clearTimers, baseBand]);

  // Cleanup on unmount — and leave the server queue if still waiting in it.
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      clearTimers();
      if (['joining', 'queuing'].includes(phaseRef.current)) {
        void postLeaveRef.current({});
      }
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
