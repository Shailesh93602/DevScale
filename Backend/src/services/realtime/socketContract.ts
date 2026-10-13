import type { Socket } from 'socket.io';

// Define socket event types
export enum SocketEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // Battle events
  BATTLE_JOIN = 'battle:join',
  BATTLE_LEAVE = 'battle:leave',
  BATTLE_STATE_UPDATE = 'battle:state_update',
  BATTLE_PARTICIPANT_JOIN = 'battle:participant_join',
  BATTLE_PARTICIPANT_LEAVE = 'battle:participant_leave',
  BATTLE_SCORE_UPDATE = 'battle:score_update',
  BATTLE_TIMER_SYNC = 'battle:timer_sync',
  BATTLE_QUESTION_CHANGE = 'battle:question_change',
  BATTLE_COMPLETED = 'battle:completed',

  // Chat events
  CHAT_MESSAGE = 'chat:message',
  CHAT_JOIN = 'chat:join',
  CHAT_LEAVE = 'chat:leave',
}

// Define participant update type
export interface ParticipantUpdate {
  battle_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'joined' | 'left' | 'active' | 'inactive';
}

// Define chat message type
export interface ChatMessage {
  battle_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  message: string;
  timestamp: number;
}

// Redis key helpers — all socket state lives here so it's shared across all server instances
export const USER_SOCKETS_KEY = (userId: string) =>
  `eduscale:sockets:${userId}`;
export const BATTLE_USERS_KEY = (battleId: string) =>
  `eduscale:battle:users:${battleId}`;
// Reverse index (user → battles); replaces a blocking `KEYS` scan on disconnect (FINDINGS.md #15).
export const USER_BATTLES_KEY = (userId: string) =>
  `eduscale:user:battles:${userId}`;
export const PRESENCE_KEY = (userId: string) => `eduscale:presence:${userId}`;
export const SOCKET_TTL = 24 * 60 * 60; // 1 day — auto-expire orphaned keys
export const PRESENCE_TTL = 35; // 35 s — client pings every 25 s; gone after 35 s silence

/** Room notification for a participant arriving or leaving. */
export function participantUpdate(
  socket: Socket,
  userId: string,
  battleId: string,
  status: ParticipantUpdate['status'],
  withAvatar = true
): ParticipantUpdate {
  return {
    battle_id: battleId,
    user_id: userId,
    username: socket.data.user?.username || 'Anonymous',
    ...(withAvatar ? { avatar_url: socket.data.user?.avatar_url } : {}),
    status,
  };
}
