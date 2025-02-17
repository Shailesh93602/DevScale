import { realTimeEventSchema } from './websocket';
import {
  RealTimeEventMap,
  realTimeEventTypes,
  WebSocketEvent,
} from '@/types/websocket';

export const isValidEventType = (
  type: string,
): type is keyof RealTimeEventMap => {
  return realTimeEventTypes.includes(
    type as (typeof realTimeEventTypes)[number],
  );
};

export const validateWebSocketEvent = async (
  event: unknown,
): Promise<WebSocketEvent> => {
  try {
    const validated = await realTimeEventSchema.validate(event, {
      abortEarly: false,
    });
    if (!isValidEventType(validated.type)) {
      throw new Error('Invalid event type');
    }
    return validated as WebSocketEvent;
  } catch (error) {
    console.error('WebSocket validation failed:', error);
    throw new Error('Invalid WebSocket message format');
  }
};

export const isValidEventData = <T extends keyof RealTimeEventMap>(
  eventType: T,
  data: unknown,
): data is RealTimeEventMap[T] => {
  try {
    // Use Yup's resolve to get the correct schema
    const schema = realTimeEventSchema.resolve({
      value: { type: eventType },
      context: {},
    });
    return schema.isValidSync(data);
  } catch {
    return false;
  }
};
