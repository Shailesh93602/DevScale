import { useEffect, useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

interface LocalBattleEventMap {
  'battle:state_update': BattleStateUpdateEvent;
  'battle:question': BattleQuestionEvent;
  'battle:answer': BattleAnswerEvent;
  'battle:participant_join': BattleParticipantEvent;
  'battle:participant_leave': BattleParticipantEvent;
  'battle:participant_ready': BattleParticipantEvent;
  'battle:score_update': BattleScoreEvent;
  'battle:complete': BattleCompleteEvent;
  'chat:message': ChatMessageEvent;
  'battle:timer_sync': TimerSyncEvent;
  'battle:join': { battle_id: string };
}

interface BattleStateUpdateEvent {
  battle_id: string;
  status: string;
  current_participants: number;
  current_question_index?: number;
  time_remaining?: number;
}

interface BattleQuestionEvent {
  battle_id: string;
  question_id: string;
  question: string;
  options: string[];
  time_limit: number;
}

interface BattleAnswerEvent {
  battle_id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_correct: boolean;
  time_taken: number;
}

interface BattleParticipantEvent {
  battle_id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  is_ready?: boolean;
  status: string;
}

interface BattleScoreEvent {
  battle_id: string;
  user_id: string;
  score: number;
  rank: number;
  username: string;
}

interface BattleCompleteEvent {
  battle_id: string;
  results: {
    user_id: string;
    username: string;
    avatar_url: string;
    score: number;
    rank: number;
  }[];
}

interface ChatMessageEvent {
  battle_id: string;
  message: string;
  timestamp: number;
  username: string;
  avatar_url: string;
  user_id: string;
}

interface TimerSyncEvent {
  battle_id: string;
  question_id: string;
  time_remaining: number;
}

// Hook for using battle WebSocket events
export const useBattleWebSocket = <T extends keyof LocalBattleEventMap>(
  event: T,
  battleId: string,
  callback: (data: LocalBattleEventMap[T]) => void,
) => {
  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(
      process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
      {
        path: '/socket.io',
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      },
    );

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:battle', { battle_id: battleId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to battle server. Please try again.',
        variant: 'destructive',
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event, callback as any);

    socketRef.current = socket;
  }, [battleId, event, callback, toast]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('leave:battle', { battle_id: battleId });
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, [battleId]);

  const sendToBattle = useCallback(
    async <T extends keyof LocalBattleEventMap>(
      event: T,
      data: Omit<LocalBattleEventMap[T], 'battleId'>,
    ) => {
      if (!socketRef.current?.connected) {
        throw new Error('Not connected to WebSocket server');
      }

      return new Promise<void>((resolve, reject) => {
        socketRef.current?.emit(
          event,
          { ...data, battleId },
          (response: { success: boolean; error?: string }) => {
            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error || 'Failed to send message'));
            }
          },
        );
      });
    },
    [battleId],
  );

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendToBattle,
  };
};

// Hook for using battle chat
export const useBattleChat = (battleId: string) => {
  const { isConnected, sendToBattle } = useBattleWebSocket(
    'chat:message',
    battleId,
    () => {},
  );
  const [messages, setMessages] = useState<
    LocalBattleEventMap['chat:message'][]
  >([]);

  // Listen for chat messages
  useEffect(() => {
    if (!battleId || !isConnected) return;

    const handleChatMessage = (data: LocalBattleEventMap['chat:message']) => {
      setMessages((prev) => [...prev, data]);
    };

    const unsubscribe = addEventListener('chat:message', (data: unknown) => {
      if (
        typeof data === 'object' &&
        data !== null &&
        'battle_id' in data &&
        data.battle_id === battleId
      ) {
        handleChatMessage(data as LocalBattleEventMap['chat:message']);
      }
    });

    return unsubscribe;
  }, [battleId, isConnected]);

  // Send chat message
  const sendMessage = (message: string) => {
    if (!message.trim()) return;

    sendToBattle('chat:message', {
      message: message.trim(),
      timestamp: Date.now(),
      battle_id: battleId,
      username: 'current_user',
      avatar_url: 'current_user_avatar',
      user_id: 'current_user',
    });
  };

  return {
    messages,
    sendMessage,
    isConnected,
  };
};

// Hook for using battle timer
export const useBattleTimer = (battleId: string) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Listen for timer sync events
  useBattleWebSocket('battle:timer_sync', battleId, (data) => {
    setQuestionId(data.question_id);
    setTimeRemaining(data.time_remaining);
    setIsActive(true);
  });

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || !isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isActive]);

  return {
    timeRemaining,
    questionId,
    isActive,
  };
};

// Hook for using battle state
export const useBattleState = (battleId: string) => {
  const [battleState, setBattleState] = useState<
    LocalBattleEventMap['battle:state_update'] | null
  >(null);

  // Listen for battle state updates
  useBattleWebSocket('battle:state_update', battleId, (data) => {
    setBattleState(data);
  });

  return battleState;
};

// Hook for using battle leaderboard
export const useBattleLeaderboard = (battleId: string) => {
  const [leaderboard, setLeaderboard] = useState<
    LocalBattleEventMap['battle:score_update'][]
  >([]);

  // Listen for score updates
  useBattleWebSocket('battle:score_update', battleId, (data) => {
    setLeaderboard((prev) => {
      // Update existing entry or add new one
      const exists = prev.some((entry) => entry.user_id === data.user_id);
      if (exists) {
        return prev
          .map((entry) => (entry.user_id === data.user_id ? data : entry))
          .sort((a, b) => a.rank - b.rank);
      } else {
        return [...prev, data].sort((a, b) => a.rank - b.rank);
      }
    });
  });

  return leaderboard;
};

// Hook for using battle participants
export const useBattleParticipants = (battleId: string) => {
  const [participants, setParticipants] = useState<
    Map<string, LocalBattleEventMap['battle:participant_join']>
  >(new Map());

  // Listen for participant join events
  useBattleWebSocket('battle:participant_join', battleId, (data) => {
    setParticipants((prev) => {
      const newMap = new Map(prev);
      newMap.set(data.user_id, data);
      return newMap;
    });
  });

  // Listen for participant leave events
  useBattleWebSocket('battle:participant_leave', battleId, (data) => {
    setParticipants((prev) => {
      const newMap = new Map(prev);
      newMap.delete(data.user_id);
      return newMap;
    });
  });

  return Array.from(participants.values());
};
