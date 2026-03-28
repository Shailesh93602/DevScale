import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { LeaderboardEntry } from '@/types/battle';

// ── Socket event shapes (matching backend battleSocket.ts) ──────────────────

export interface BattleEventMap {
  // Status lifecycle
  'battle:status_changed': { status: string };
  'battle:countdown': { seconds_remaining: number };
  'battle:started': { started_at: number };
  'battle:completed': {
    winner_id: string | null;
    leaderboard: LeaderboardEntry[];
  };

  // Question flow
  'battle:question': {
    index: number;
    total_questions: number;
    question_id: string;
    time_limit: number;
    ends_at: number;
  };
  'battle:timer_tick': { seconds_remaining: number };

  // Answers
  'battle:answer_result': {
    is_correct: boolean;
    points_earned: number;
    correct_answer: number;
    explanation?: string | null;
  };
  'battle:score_update': { leaderboard: LeaderboardEntry[] };

  // Participants
  'battle:participant_joined': {
    user: { id: string; username: string; avatar_url?: string | null };
    total_count: number;
  };
  'battle:participant_ready': {
    user_id: string;
    ready_count: number;
    total_count: number;
  };
  'battle:participant_left': { user_id: string; total_count: number };

  // Reconnect state snapshot
  'battle:state': {
    status: string;
    current_question_index: number;
    question_ends_at: number | null;
    leaderboard: LeaderboardEntry[];
    participants: Array<{
      user_id: string;
      username: string;
      avatar_url?: string | null;
      status: string;
      score: number;
      rank: number;
    }>;
  };

  // Chat
  'chat:message': {
    battle_id: string;
    user_id: string;
    username: string;
    avatar_url?: string;
    message: string;
    timestamp: number;
  };

  // Client → server
  'battle:join': { battle_id: string };
  'battle:leave': { battle_id: string };
}

async function getAuthToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

// ── Shared socket singleton per battle ──────────────────────────────────────

const sockets = new Map<string, Socket>();

function getSocket(battleId: string, token: string | null): Socket {
  if (sockets.has(battleId)) return sockets.get(battleId)!;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL ||
    apiBase.replace(/\/api\/v1\/?$/, '') ||
    'http://localhost:5000';

  const socket = io(wsUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: token ? { token } : undefined,
  });

  socket.on('connect', () => {
    socket.emit('battle:join', { battle_id: battleId });
  });

  sockets.set(battleId, socket);
  return socket;
}

function releaseSocket(battleId: string) {
  const socket = sockets.get(battleId);
  if (socket) {
    socket.emit('battle:leave', { battle_id: battleId });
    socket.disconnect();
    sockets.delete(battleId);
  }
}

// ── Primary hook ─────────────────────────────────────────────────────────────

export function useBattleSocket(battleId: string) {
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!battleId || initialized.current) return;
    initialized.current = true;

    getAuthToken().then((token) => {
      const socket = getSocket(battleId, token);
      socketRef.current = socket;

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);
      const onError = (err: Error) => {
        if (!err.message.includes('Authentication')) {
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to battle server.',
            variant: 'destructive',
          });
        }
      };

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onError);

      if (socket.connected) setIsConnected(true);
    });

    return () => {
      // Don't destroy socket on unmount — let consumers call disconnect explicitly
    };
  }, [battleId, toast]);

  const on = useCallback(
    <E extends keyof BattleEventMap>(
      event: E,
      handler: (data: BattleEventMap[E]) => void,
    ): (() => void) => {
      const s = socketRef.current;
      s?.on(event as string, handler as (data: unknown) => void);
      return () => {
        s?.off(event as string, handler as (data: unknown) => void);
      };
    },
    [],
  );

  const emit = useCallback(
    <E extends keyof BattleEventMap>(event: E, data: BattleEventMap[E]) => {
      socketRef.current?.emit(event as string, data);
    },
    [],
  );

  const disconnect = useCallback(() => {
    releaseSocket(battleId);
    socketRef.current = null;
    setIsConnected(false);
  }, [battleId]);

  return { isConnected, on, emit, disconnect, socket: socketRef };
}

// ── Convenience hooks ────────────────────────────────────────────────────────

export function useBattleChat(battleId: string) {
  const { user } = useAuth();
  const { isConnected, on, emit } = useBattleSocket(battleId);
  const [messages, setMessages] = useState<BattleEventMap['chat:message'][]>(
    [],
  );

  useEffect(() => {
    return on('chat:message', (msg) => {
      if (msg.battle_id === battleId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
  }, [battleId, on]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || !user?.id) return;
      emit('chat:message', {
        battle_id: battleId,
        user_id: user.id,
        username: user.username || 'Anonymous',
        avatar_url: user.avatar_url || '',
        message: message.trim(),
        timestamp: Date.now(),
      });
    },
    [battleId, emit, user],
  );

  return { messages, sendMessage, isConnected };
}

export function useBattleTimer(battleId: string) {
  const { on } = useBattleSocket(battleId);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);

  useEffect(() => {
    const offTick = on('battle:timer_tick', (data) =>
      setSecondsRemaining(data.seconds_remaining),
    );
    const offQ = on('battle:question', (data) => {
      setSecondsRemaining(data.time_limit);
      setEndsAt(data.ends_at);
    });
    return () => {
      offTick();
      offQ();
    };
  }, [on]);

  return { secondsRemaining, endsAt };
}

export function useBattleLeaderboard(battleId: string) {
  const { on } = useBattleSocket(battleId);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    return on('battle:score_update', (data) =>
      setLeaderboard(data.leaderboard),
    );
  }, [on]);

  const seedLeaderboard = useCallback((entries: LeaderboardEntry[]) => {
    setLeaderboard((prev) => {
      if (prev.length > 0) return prev; // ws data takes precedence
      return entries;
    });
  }, []);

  return { leaderboard, seedLeaderboard };
}

// ── Legacy / compat exports ──────────────────────────────────────────────────

export const useBattleWebSocket = useBattleSocket;

export function useBattleParticipants(battleId: string) {
  const { on } = useBattleSocket(battleId);
  const [joined, setJoined] = useState<
    { user_id: string; username: string; avatar_url?: string | null }[]
  >([]);

  useEffect(() => {
    const offJoin = on('battle:participant_joined', ({ user }) => {
      setJoined((prev) =>
        prev.some((u) => u.user_id === user.id)
          ? prev
          : [
              ...prev,
              {
                user_id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
              },
            ],
      );
    });
    const offLeave = on('battle:participant_left', ({ user_id }) => {
      setJoined((prev) => prev.filter((u) => u.user_id !== user_id));
    });
    return () => {
      offJoin();
      offLeave();
    };
  }, [on]);

  return joined;
}
