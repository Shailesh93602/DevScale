import { BattleStatus } from './battle';

// Battle WebSocket event types
export const battleEventTypes = [
  'battle:join',
  'battle:leave',
  'battle:state_update',
  'battle:participant_join',
  'battle:participant_leave',
  'battle:score_update',
  'battle:timer_sync',
  'battle:question_change',
  'battle:completed',
  'chat:message',
  'chat:join',
  'chat:leave',
] as const;

// Battle WebSocket event map
export type BattleEventMap = {
  'battle:join': BattleJoinEvent;
  'battle:leave': BattleLeaveEvent;
  'battle:state_update': BattleStateUpdateEvent;
  'battle:participant_join': ParticipantUpdateEvent;
  'battle:participant_leave': ParticipantUpdateEvent;
  'battle:participant_ready': ParticipantReadyEvent;
  'battle:score_update': ScoreUpdateEvent;
  'battle:timer_sync': TimerSyncEvent;
  'battle:question_change': QuestionChangeEvent;
  'battle:completed': BattleCompletedEvent;
  'chat:message': ChatMessageEvent;
  'chat:join': ChatJoinEvent;
  'chat:leave': ChatLeaveEvent;
};

// Base event interface
export interface BattleEvent<T extends keyof BattleEventMap> {
  type: T;
  data: BattleEventMap[T];
}

// Battle join event
export interface BattleJoinEvent {
  battle_id: string;
}

// Battle leave event
export interface BattleLeaveEvent {
  battle_id: string;
}

// Battle state update event
export interface BattleStateUpdateEvent {
  battleId: string;
  status: BattleStatus;
  currentParticipants: number;
  currentQuestionIndex?: number;
  timeRemaining?: number;
}

// Participant update event
export interface ParticipantUpdateEvent {
  battleId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  status: 'joined' | 'left' | 'active' | 'inactive';
}

// Score update event
export interface ScoreUpdateEvent {
  battleId: string;
  userId: string;
  username: string;
  score: number;
  rank: number;
}

// Timer sync event
export interface TimerSyncEvent {
  battleId: string;
  questionId: string;
  startTime: number;
  endTime: number;
  timeRemaining: number;
}

// Question change event
export interface QuestionChangeEvent {
  battle_id: string;
  question_id: string;
  question_index: number;
}

// Battle completed event
export interface BattleCompletedEvent {
  battleId: string;
  results: {
    participants: {
      userId: string;
      username: string;
      avatarUrl?: string;
      score: number;
      rank: number;
    }[];
  };
}

// Chat message event
export interface ChatMessageEvent {
  battleId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  message: string;
  timestamp: number;
}

// Chat join event
export interface ChatJoinEvent {
  battleId: string;
  userId: string;
  username: string;
}

// Chat leave event
export interface ChatLeaveEvent {
  battleId: string;
  userId: string;
  username: string;
}

// Participant ready event
export interface ParticipantReadyEvent {
  battleId: string;
  userId: string;
  isReady: boolean;
}

// Type guard for battle events
export const isBattleEvent = <T extends keyof BattleEventMap>(
  event: unknown,
): event is BattleEvent<T> => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    battleEventTypes.includes(event.type as (typeof battleEventTypes)[number])
  );
};
