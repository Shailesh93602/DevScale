import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config';
import logger from '../utils/logger';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  connect() {
    this.socket = io(WS_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('WebSocket client connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', { reason });
    });

    this.socket.on('error', (error) => {
      logger.error('WebSocket client error', { error });
    });
  }

  subscribe<T>(event: string, callback: (data: T) => void) {
    this.socket?.on(event, callback);
  }

  unsubscribe(event: string) {
    this.socket?.off(event);
  }

  emit<T>(event: string, data: T) {
    this.socket?.emit(event, data);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const wsService = new WebSocketService();
