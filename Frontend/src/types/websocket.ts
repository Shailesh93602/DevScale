export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
};

// Add this runtime array
export const realTimeEventTypes = [
  'chat:message',
  'notification:new',
  'presence:update',
] as const;

// Update type definition
export type RealTimeEventMap = {
  [K in (typeof realTimeEventTypes)[number]]: K extends 'chat:message'
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
