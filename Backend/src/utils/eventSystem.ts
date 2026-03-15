import { EventEmitter } from 'events';
import logger from './logger';

interface EventData {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

export class EventSystem {
  private static emitter = new EventEmitter();
  private static readonly MAX_LISTENERS = 100;

  static {
    this.emitter.setMaxListeners(this.MAX_LISTENERS);
  }

  static emit(eventName: string, data: Omit<EventData, 'timestamp'>) {
    const eventData: EventData = {
      ...data,
      timestamp: Date.now(),
    };

    try {
      this.emitter.emit(eventName, eventData);
      logger.debug('Event emitted:', { eventName, ...eventData });
    } catch (error) {
      logger.error('Event emission failed:', { eventName, error });
    }
  }

  static on(eventName: string, handler: (data: EventData) => void) {
    try {
      this.emitter.on(eventName, handler);
      logger.debug('Event handler registered:', { eventName });
    } catch (error) {
      logger.error('Event handler registration failed:', { eventName, error });
    }
  }

  static off(eventName: string, handler: (data: EventData) => void) {
    try {
      this.emitter.off(eventName, handler);
      logger.debug('Event handler removed:', { eventName });
    } catch (error) {
      logger.error('Event handler removal failed:', { eventName, error });
    }
  }

  static once(eventName: string, handler: (data: EventData) => void) {
    try {
      this.emitter.once(eventName, handler);
      logger.debug('One-time event handler registered:', { eventName });
    } catch (error) {
      logger.error('One-time event handler registration failed:', {
        eventName,
        error,
      });
    }
  }
}
