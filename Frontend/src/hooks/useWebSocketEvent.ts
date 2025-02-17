import { useWebSocket } from '@/contexts/WebSocketContext';
import { isValidEventData } from '@/lib/validation/helpers';
import { RealTimeEventMap } from '@/types/websocket';
import { useEffect } from 'react';

export const useWebSocketEvent = <T extends keyof RealTimeEventMap>(
  eventType: T,
  callback: (data: RealTimeEventMap[T]) => void,
) => {
  const { addEventListener } = useWebSocket();

  useEffect(() => {
    const typedCallback = (data: unknown) => {
      // Add validation check here
      if (isValidEventData(eventType, data)) {
        callback(data as RealTimeEventMap[typeof eventType]);
      }
    };
    const unsubscribe = addEventListener(eventType, typedCallback);
    return unsubscribe;
  }, [addEventListener, eventType, callback]);
};
