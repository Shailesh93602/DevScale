'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import { createClient } from '@/utils/supabase/client';
import { validateWebSocketEvent } from '@/lib/validations/helpers';

type WebSocketEvent = {
  type: string;
  data: unknown;
};

type WebSocketContextType = {
  send: (event: WebSocketEvent) => void;
  addEventListener: (
    type: string,
    callback: (data: unknown) => void,
  ) => () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const eventListeners = useRef<Map<string, Set<(data: unknown) => void>>>(
    new Map(),
  );

  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closed = useRef(false);

  const connect = useCallback(async () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl || !/^wss?:\/\//.test(wsUrl)) return;
    const {
      data: { session },
    } = await createClient().auth.getSession();
    const token = session?.access_token;
    if (!token || closed.current) return;

    // The bearer token goes in the first frame, never the URL: proxies and access logs record URLs.
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      reconnectAttempts.current = 0;
      ws.current?.send(JSON.stringify({ type: 'auth', data: { token } }));
    };

    ws.current.onmessage = async (event) => {
      try {
        const parsedEvent = JSON.parse(event.data);
        const validatedEvent = await validateWebSocketEvent(parsedEvent);

        const listeners = eventListeners.current.get(validatedEvent.type);
        listeners?.forEach((callback) => callback(validatedEvent.data));
      } catch (error) {
        console.error('WebSocket message error:', error);
        // Dispatch error event
        const errorListeners = eventListeners.current.get('error');
        errorListeners?.forEach((callback) => callback(error));
      }
    };

    ws.current.onclose = (event) => {
      if (event.code !== 1000 && !closed.current) {
        // 1000 is normal closure
        const delay = Math.min(5000 * (reconnectAttempts.current + 1), 30000);
        reconnectTimer.current = setTimeout(() => void connect(), delay);
        reconnectAttempts.current += 1;
      }
    };
  }, []);

  const send = useCallback((event: WebSocketEvent) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(event));
    }
  }, []);

  const addEventListener = useCallback(
    (type: string, callback: (data: unknown) => void) => {
      if (!eventListeners.current.has(type)) {
        eventListeners.current.set(type, new Set());
      }
      eventListeners.current.get(type)?.add(callback);

      return () => {
        eventListeners.current.get(type)?.delete(callback);
      };
    },
    [],
  );

  useEffect(() => {
    closed.current = false;
    void connect();
    return () => {
      closed.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      ws.current?.close(1000, 'Component unmounted');
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={{ send, addEventListener }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
