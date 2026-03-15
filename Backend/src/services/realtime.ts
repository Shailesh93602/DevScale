import { wsService } from './websocket';

export interface RealtimeUpdate<T> {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: T;
  timestamp: number;
}

export class RealtimeService {
  private subscribers: Map<
    string,
    Set<(data: RealtimeUpdate<unknown>) => void>
  > = new Map();

  initialize() {
    wsService.connect();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    wsService.subscribe<RealtimeUpdate<unknown>>('data_update', (update) => {
      const subscribers = this.subscribers.get(update.entity);
      subscribers?.forEach((callback) => callback(update));
    });
  }

  subscribe<T>(entity: string, callback: (update: RealtimeUpdate<T>) => void) {
    if (!this.subscribers.has(entity)) {
      this.subscribers.set(entity, new Set());
    }
    this.subscribers
      .get(entity)
      ?.add(callback as (data: RealtimeUpdate<unknown>) => void);
  }

  unsubscribe<T>(
    entity: string,
    callback: (update: RealtimeUpdate<T>) => void
  ) {
    this.subscribers
      .get(entity)
      ?.delete(callback as (data: RealtimeUpdate<unknown>) => void);
  }

  cleanup() {
    this.subscribers.clear();
    wsService.disconnect();
  }
}

export const realtimeService = new RealtimeService();
