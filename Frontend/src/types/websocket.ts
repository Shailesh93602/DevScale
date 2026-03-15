import { BattleParticipant, BattleStatus } from './battle';

export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
};

// Add battle event types
export const battleEventTypes = [
  'battle:join',
  'battle:leave',
  'battle:ready',
  'battle:start',
  'battle:end',
  'battle:state_update',
  'battle:participant_update',
  'battle:score_update',
  'battle:chat_message',
] as const;

// Add this runtime array
export const realTimeEventTypes = [
  'chat:message',
  'notification:new',
  'presence:update',
  ...battleEventTypes,
] as const;

// Battle event map
export type BattleEventMap = {
  'battle:join': {
    battleId: string;
    participant: BattleParticipant;
  };
  'battle:leave': {
    battleId: string;
    participantId: string;
  };
  'battle:ready': {
    battleId: string;
    participantId: string;
    isReady: boolean;
  };
  'battle:start': {
    battleId: string;
    startTime: string;
  };
  'battle:end': {
    battleId: string;
    endTime: string;
    results: {
      participants: {
        participantId: string;
        score: number;
        rank: number;
      }[];
    };
  };
  'battle:state_update': {
    battleId: string;
    status: BattleStatus;
    currentParticipants: number;
    startTime?: string;
    endTime?: string;
  };
  'battle:participant_update': {
    battleId: string;
    participant: BattleParticipant & {
      isReady: boolean;
      score?: number;
      rank?: number;
    };
  };
  'battle:score_update': {
    battleId: string;
    participantId: string;
    score: number;
    rank: number;
  };
  'battle:chat_message': {
    battleId: string;
    message: ChatMessage;
  };
};

// Update type definition
export type RealTimeEventMap = {
  [K in (typeof realTimeEventTypes)[number]]: K extends keyof BattleEventMap
    ? BattleEventMap[K]
    : K extends 'chat:message'
      ? ChatMessage
      : K extends 'notification:new'
        ? Notification
        : K extends 'presence:update'
          ? PresenceUpdate
          : never;
};

export type WebSocketEvent<
  T extends keyof RealTimeEventMap = keyof RealTimeEventMap,
> = {
  type: T;
  data?: RealTimeEventMap[T];
};

// Add explicit type guard
export const isWebSocketEvent = <T extends keyof RealTimeEventMap>(
  event: unknown,
): event is WebSocketEvent<T> => {
  return (
    typeof event === 'object' &&
    event !== null &&
    'type' in event &&
    realTimeEventTypes.includes(
      event.type as (typeof realTimeEventTypes)[number],
    )
  );
};

export type PresenceUpdate = {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};
