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
  /** Present when this player was matched while waiting and the socket push may have been missed. */
  match?: MatchResult;
}

/** The live-updates socket, surfaced so a refused or dropped socket is never silent. */
export type RealtimeStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'unavailable';

/** Handshake refusals are retried this many times, backing off 1 s, 2 s, 4 s ... up to 30 s. */
export const SOCKET_RETRY_LIMIT = 6;
const SOCKET_RETRY_MAX_DELAY_MS = 30_000;
export const socketRetryDelay = (attempt: number) =>
  Math.min(SOCKET_RETRY_MAX_DELAY_MS, 1000 * 2 ** attempt);

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
  realtimeStatus: RealtimeStatus;
  /** Retry the live-updates socket now (after it was reported unavailable). */
  reconnectRealtime: () => void;
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
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>('connecting');

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
  const reconnectRef = useRef<() => void>(() => {});
  const checkStatusRef = useRef<() => Promise<void>>(async () => {});
  const applyMatchRef = useRef<(data: MatchResult) => void>(() => {});
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

  // The socket is how a waiting player hears `matchmaking:matched`. It connects
  // when a session exists, and a refused handshake is retried with backoff
  // because socket.io-client never retries a middleware refusal itself.
  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeAuth: (() => void) | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let supabase: ReturnType<typeof createClient> | null = null;

    const freshToken = async () => {
      try {
        const { data } = (await supabase?.auth.getSession()) ?? {};
        return data?.session?.access_token;
      } catch {
        return undefined;
      }
    };

    const retryNow = async (socket: Socket) => {
      retryTimer = null;
      const token = await freshToken();
      if (!isSubscribed || socket.connected) return;
      if (token) socket.auth = { token };
      socket.connect();
    };

    function connect(token: string | undefined) {
      if (!token || !isSubscribed) return;
      if (socketRef.current) {
        // Keep later reconnects on the current (refreshed) token.
        socketRef.current.auth = { token };
        return;
      }
      try {
        const socket = io(socketBaseUrl(), {
          path: '/socket.io',
          transports: ['websocket'],
          reconnection: true,
          auth: { token },
        });

        socketRef.current = socket;

        socket.on('matchmaking:matched', (data: MatchResult) => {
          if (isSubscribed) applyMatchRef.current(data);
        });

        socket.on('connect', () => {
          if (!isSubscribed) return;
          attempts = 0;
          setRealtimeStatus('connected');
          // A match made while this socket was down was pushed to nobody.
          if (phaseRef.current === 'queuing') void checkStatusRef.current();
        });

        socket.on('disconnect', () => {
          if (isSubscribed) setRealtimeStatus('reconnecting');
        });

        socket.on('connect_error', (err: Error & { data?: unknown }) => {
          if (!isSubscribed) return;
          // Transport failure: socket.io is already reconnecting on its own.
          if (socket.active) {
            setRealtimeStatus('reconnecting');
            return;
          }
          const retryable =
            (err.data as { retryable?: boolean } | undefined)?.retryable !==
            false;
          if (!retryable || attempts >= SOCKET_RETRY_LIMIT) {
            setRealtimeStatus('unavailable');
            return;
          }
          setRealtimeStatus('reconnecting');
          retryTimer = setTimeout(
            () => void retryNow(socket),
            socketRetryDelay(attempts++),
          );
        });

        reconnectRef.current = () => {
          if (socket.connected) return;
          if (retryTimer) clearTimeout(retryTimer);
          attempts = 0;
          setRealtimeStatus('reconnecting');
          void retryNow(socket);
        };
      } catch {
        setRealtimeStatus('unavailable');
      }
    }

    try {
      supabase = createClient();
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
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribeAuth?.();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const reconnectRealtime = useCallback(() => reconnectRef.current(), []);

  // A match is applied once, whichever of the socket, /status or the inline join reports it.
  const applyMatch = useCallback(
    (data: MatchResult) => {
      if (unmountedRef.current || phaseRef.current === 'matched') return;
      phaseRef.current = 'matched';
      clearTimers();
      setMatchedBattle(data);
      setPhase('matched');
    },
    [clearTimers],
  );
  useEffect(() => {
    applyMatchRef.current = applyMatch;
  }, [applyMatch]);

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

  // Poll status while queuing. It also delivers a match the socket missed.
  const checkStatus = useCallback(async () => {
    const res = await getStatus();
    if (!res.success || !res.data || phaseRef.current !== 'queuing') return;
    setQueueSize(res.data.queueSize);
    if (res.data.rating !== null) {
      setUserRating(res.data.rating);
    }
    if (res.data.match?.battleId) applyMatch(res.data.match);
  }, [getStatus, applyMatch]);

  useEffect(() => {
    checkStatusRef.current = checkStatus;
  }, [checkStatus]);

  useEffect(() => {
    if (phase !== 'queuing') return;

    void checkStatus();
    pollTimerRef.current = setInterval(checkStatus, pollIntervalMs);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [phase, checkStatus, pollIntervalMs]);

  // Join matchmaking
  const joinQueue = useCallback(async () => {
    setError(null);
    phaseRef.current = 'joining';
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
      applyMatch(res.data);
      return;
    }

    // Otherwise enqueued and waiting
    phaseRef.current = 'queuing';
    setPhase('queuing');
  }, [postJoin, applyMatch]);

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
    realtimeStatus,
    reconnectRealtime,
    joinQueue,
    leaveQueue,
    reset,
  };
}
