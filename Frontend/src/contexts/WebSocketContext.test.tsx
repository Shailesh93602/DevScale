import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: { access_token: 'secret-token' } },
      }),
    },
  }),
}));

import { WebSocketProvider } from './WebSocketContext';

class FakeSocket {
  static instances: FakeSocket[] = [];
  url: string;
  sent: string[] = [];
  readyState = 1;
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  onmessage: unknown = null;
  constructor(url: string) {
    this.url = url;
    FakeSocket.instances.push(this);
  }
  send(frame: string) {
    this.sent.push(frame);
  }
  close() {}
}

describe('WebSocketProvider', () => {
  beforeEach(() => {
    FakeSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeSocket);
    vi.stubEnv('NEXT_PUBLIC_WS_URL', 'wss://ws.example.test');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it('authenticates in the first frame, never in the URL', async () => {
    render(<WebSocketProvider>x</WebSocketProvider>);
    await waitFor(() => expect(FakeSocket.instances).toHaveLength(1));
    const sock = FakeSocket.instances[0];
    expect(sock.url).not.toContain('secret-token');
    sock.onopen?.();
    expect(JSON.parse(sock.sent[0])).toEqual({
      type: 'auth',
      data: { token: 'secret-token' },
    });
  });

  it('does not reconnect after unmount', async () => {
    const { unmount } = render(<WebSocketProvider>x</WebSocketProvider>);
    await waitFor(() => expect(FakeSocket.instances).toHaveLength(1));
    vi.useFakeTimers();
    FakeSocket.instances[0].onclose?.({ code: 1006 });
    unmount();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(FakeSocket.instances).toHaveLength(1);
  });
});
