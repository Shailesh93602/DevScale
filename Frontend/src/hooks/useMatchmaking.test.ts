import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

type Handler = (data: unknown) => void;

const h = vi.hoisted(() => {
  const makeSocket = () => {
    const listeners = new Map<string, Set<Handler>>();
    return {
      connected: true,
      active: false,
      auth: {} as { token?: string },
      connect: vi.fn(),
      on: (event: string, fn: Handler) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(fn);
      },
      off: (event: string, fn: Handler) => {
        listeners.get(event)?.delete(fn);
      },
      emit: () => {},
      disconnect: () => {},
      receive(event: string, data: unknown) {
        for (const fn of listeners.get(event) ?? []) fn(data);
      },
      listenerCount(event: string) {
        return listeners.get(event)?.size ?? 0;
      },
    };
  };

  const state = {
    sockets: [] as ReturnType<typeof makeSocket>[],
    joinMock: vi.fn(),
    leaveMock: vi.fn(),
    statusMock: vi.fn(),
    sessionToken: 'test-token' as string | null,
    authListeners: [] as Array<
      (event: string, session: { access_token: string } | null) => void
    >,
  };

  return { makeSocket, state };
});

vi.mock('socket.io-client', () => ({
  io: () => {
    const s = h.makeSocket();
    h.state.sockets.push(s);
    return s;
  },
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: h.state.sessionToken
              ? { access_token: h.state.sessionToken }
              : null,
          },
        }),
      onAuthStateChange: (
        fn: (event: string, session: { access_token: string } | null) => void,
      ) => {
        h.state.authListeners.push(fn);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  }),
}));

vi.mock('@/hooks/useAxios', () => ({
  useAxiosPost: (url: string) => {
    if (url === '/matchmaking/join') {
      return [h.state.joinMock, { isLoading: false }];
    }
    if (url === '/matchmaking/leave') {
      return [h.state.leaveMock, { isLoading: false }];
    }
    return [vi.fn(), { isLoading: false }];
  },
  useAxiosGet: (url: string) => {
    if (url === '/matchmaking/status') {
      return [h.state.statusMock, { isLoading: false }];
    }
    return [vi.fn(), { isLoading: false }];
  },
}));

import {
  useMatchmaking,
  SOCKET_RETRY_LIMIT,
  socketRetryDelay,
} from './useMatchmaking';

describe('useMatchmaking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    h.state.sockets.length = 0;
    h.state.sessionToken = 'test-token';
    h.state.authListeners.length = 0;
    h.state.joinMock.mockReset();
    h.state.leaveMock.mockReset();
    h.state.statusMock.mockReset();

    h.state.leaveMock.mockResolvedValue({
      success: true,
      data: { left: true },
    });
    h.state.statusMock.mockResolvedValue({
      success: true,
      data: { inQueue: false, queueSize: 0, rating: 1250 },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('starts in idle phase with default rating band', () => {
    const { result } = renderHook(() => useMatchmaking());
    expect(result.current.phase).toBe('idle');
    expect(result.current.currentBand).toBe(100);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.matchedBattle).toBeNull();
  });

  it('transitions to matched immediately if joinQueue returns an instant pair', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: {
        matched: true,
        battleId: 'battle-instant-123',
        slug: 'ranked-match-slug',
        opponentId: 'user-opp-456',
      },
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.joinQueue();
    });

    expect(result.current.phase).toBe('matched');
    expect(result.current.matchedBattle?.battleId).toBe('battle-instant-123');
    expect(result.current.matchedBattle?.opponentId).toBe('user-opp-456');
  });

  it('transitions to queuing and expands band over time if not matched immediately', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: { matched: false },
    });

    const { result } = renderHook(() =>
      useMatchmaking({ baseBand: 100, bandPerSecond: 20, maxBand: 600 }),
    );

    await act(async () => {
      await result.current.joinQueue();
    });

    expect(result.current.phase).toBe('queuing');
    expect(result.current.currentBand).toBe(100);

    // Advance 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(result.current.elapsedSeconds).toBe(5);
    expect(result.current.currentBand).toBe(200); // 100 + 5 * 20 = 200

    // Advance to 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(25000);
      await Promise.resolve();
    });

    expect(result.current.elapsedSeconds).toBe(30);
    expect(result.current.currentBand).toBe(600); // capped at maxBand 600
  });

  it('delivers match event when push notification arrives over socket', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: { matched: false },
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.joinQueue();
      // Allow microtask ticks for socket initialization
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.phase).toBe('queuing');

    const socket = h.state.sockets[h.state.sockets.length - 1];
    expect(socket).toBeDefined();

    // Push socket event
    await act(async () => {
      socket.receive('matchmaking:matched', {
        matched: true,
        battleId: 'battle-socket-789',
        slug: 'duel-slug',
        opponentId: 'user-opp-999',
      });
      await Promise.resolve();
    });

    expect(result.current.phase).toBe('matched');
    expect(result.current.matchedBattle?.battleId).toBe('battle-socket-789');
  });

  it('transitions to timeout if maximum queue duration elapses without a match', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: { matched: false },
    });

    const { result } = renderHook(() => useMatchmaking({ timeoutMs: 15000 }));

    await act(async () => {
      await result.current.joinQueue();
    });

    expect(result.current.phase).toBe('queuing');

    await act(async () => {
      vi.advanceTimersByTime(16000);
      await Promise.resolve();
    });

    expect(result.current.phase).toBe('timeout');
  });

  it('leaves queue cleanly when leaveQueue is called', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: { matched: false },
    });
    h.state.leaveMock.mockResolvedValueOnce({
      success: true,
      data: { left: true },
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.joinQueue();
    });

    expect(result.current.phase).toBe('queuing');

    await act(async () => {
      await result.current.leaveQueue();
    });

    expect(result.current.phase).toBe('idle');
    expect(h.state.leaveMock).toHaveBeenCalled();
  });

  it('handles server join failure with error state', async () => {
    h.state.joinMock.mockResolvedValueOnce({
      success: false,
      message: 'Redis queue connection unavailable',
    });

    const { result } = renderHook(() => useMatchmaking());

    await act(async () => {
      await result.current.joinQueue();
    });

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBe('Redis queue connection unavailable');
  });

  describe('the server queue is left whenever the client stops waiting', () => {
    const queue = async () => {
      h.state.joinMock.mockResolvedValueOnce({
        success: true,
        data: { matched: false },
      });
      const hook = renderHook(() => useMatchmaking({ timeoutMs: 15000 }));
      await act(async () => {
        await hook.result.current.joinQueue();
      });
      expect(hook.result.current.phase).toBe('queuing');
      return hook;
    };

    it('on the client-side timeout', async () => {
      const { result } = await queue();
      await act(async () => {
        vi.advanceTimersByTime(16000);
        await Promise.resolve();
      });
      expect(result.current.phase).toBe('timeout');
      expect(h.state.leaveMock).toHaveBeenCalledTimes(1);
    });

    it('on reset() while queuing', async () => {
      const { result } = await queue();
      act(() => result.current.reset());
      expect(result.current.phase).toBe('idle');
      expect(h.state.leaveMock).toHaveBeenCalledTimes(1);
    });

    it('on unmount while queuing', async () => {
      const { unmount } = await queue();
      unmount();
      expect(h.state.leaveMock).toHaveBeenCalledTimes(1);
    });

    it('on unmount while the join is still in flight', async () => {
      let resolveJoin!: (v: unknown) => void;
      h.state.joinMock.mockReturnValueOnce(
        new Promise((r) => (resolveJoin = r)),
      );
      const { result, unmount } = renderHook(() => useMatchmaking());
      let joining!: Promise<void>;
      act(() => {
        joining = result.current.joinQueue();
      });
      unmount();
      // The server handles that leave first, then the join enqueues the user.
      resolveJoin({ success: true, data: { matched: false } });
      await joining;
      expect(h.state.leaveMock).toHaveBeenCalledTimes(2);
    });

    it('but not on unmount from idle', () => {
      const { unmount } = renderHook(() => useMatchmaking());
      unmount();
      expect(h.state.leaveMock).not.toHaveBeenCalled();
    });

    it('a failed leave is surfaced, not reported as idle', async () => {
      const { result } = await queue();
      h.state.leaveMock.mockResolvedValueOnce({
        success: false,
        message: 'Queue unavailable',
      });
      await act(async () => {
        await result.current.leaveQueue();
      });
      expect(result.current.phase).toBe('error');
      expect(result.current.error).toBe('Queue unavailable');
    });
  });

  it('connects the socket once a session appears after mount, and hears the match', async () => {
    h.state.sessionToken = null;
    h.state.joinMock.mockResolvedValueOnce({
      success: true,
      data: { matched: false },
    });
    const { result } = renderHook(() => useMatchmaking());
    await act(async () => {
      await result.current.joinQueue();
      await Promise.resolve();
    });
    expect(h.state.sockets).toHaveLength(0);

    act(() => {
      for (const fn of h.state.authListeners)
        fn('SIGNED_IN', { access_token: 'late-token' });
    });
    expect(h.state.sockets).toHaveLength(1);

    await act(async () => {
      h.state.sockets[0].receive('matchmaking:matched', {
        matched: true,
        battleId: 'battle-late',
      });
      await Promise.resolve();
    });
    expect(result.current.phase).toBe('matched');
    expect(result.current.matchedBattle?.battleId).toBe('battle-late');
  });

  describe('a refused or dropped socket is retried and never silent', () => {
    const mounted = async () => {
      const hook = renderHook(() => useMatchmaking());
      await act(async () => {
        await Promise.resolve();
      });
      expect(h.state.sockets).toHaveLength(1);
      return { ...hook, socket: h.state.sockets[0] };
    };
    const refuse = (
      socket: (typeof h.state.sockets)[number],
      retryable = true,
    ) => {
      socket.connected = false;
      socket.receive(
        'connect_error',
        Object.assign(new Error('Invalid authentication token'), {
          data: { code: 'AUTH_TOKEN_INVALID', retryable },
        }),
      );
    };
    const flush = async (ms: number) => {
      await act(async () => {
        vi.advanceTimersByTime(ms);
        await Promise.resolve();
        await Promise.resolve();
      });
    };

    it('a refused handshake is retried with a fresh token, then connects', async () => {
      const { result, socket } = await mounted();
      expect(result.current.realtimeStatus).toBe('connecting');

      act(() => refuse(socket));
      expect(result.current.realtimeStatus).toBe('reconnecting');
      expect(socket.connect).not.toHaveBeenCalled();

      h.state.sessionToken = 'refreshed-token';
      await flush(socketRetryDelay(0));
      expect(socket.connect).toHaveBeenCalledTimes(1);
      expect(socket.auth).toEqual({ token: 'refreshed-token' });

      act(() => {
        socket.connected = true;
        socket.receive('connect', undefined);
      });
      expect(result.current.realtimeStatus).toBe('connected');
    });

    it('backs off exponentially and reports unavailable after the limit', async () => {
      const { result, socket } = await mounted();
      for (let i = 0; i < SOCKET_RETRY_LIMIT; i++) {
        act(() => refuse(socket));
        await flush(socketRetryDelay(i) - 1);
        expect(socket.connect).toHaveBeenCalledTimes(i);
        await flush(1);
        expect(socket.connect).toHaveBeenCalledTimes(i + 1);
      }
      expect(socketRetryDelay(1)).toBe(2 * socketRetryDelay(0));
      act(() => refuse(socket));
      expect(result.current.realtimeStatus).toBe('unavailable');
      await flush(60_000);
      expect(socket.connect).toHaveBeenCalledTimes(SOCKET_RETRY_LIMIT);

      // The UI's Reconnect button starts again.
      await act(async () => {
        result.current.reconnectRealtime();
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(result.current.realtimeStatus).toBe('reconnecting');
      expect(socket.connect).toHaveBeenCalledTimes(SOCKET_RETRY_LIMIT + 1);
    });

    it('a non-retryable refusal (suspended) is reported at once, not retried', async () => {
      const { result, socket } = await mounted();
      act(() => refuse(socket, false));
      expect(result.current.realtimeStatus).toBe('unavailable');
      await flush(60_000);
      expect(socket.connect).not.toHaveBeenCalled();
    });

    it('a transport drop is left to socket.io, but shown as reconnecting', async () => {
      const { result, socket } = await mounted();
      act(() => {
        socket.active = true;
        socket.receive('connect_error', new Error('websocket error'));
      });
      expect(result.current.realtimeStatus).toBe('reconnecting');
      await flush(60_000);
      expect(socket.connect).not.toHaveBeenCalled();
    });

    it('on reconnect while queuing, a match pushed while disconnected is picked up from status', async () => {
      h.state.joinMock.mockResolvedValueOnce({
        success: true,
        data: { matched: false },
      });
      const { result, socket } = await mounted();
      await act(async () => {
        await result.current.joinQueue();
      });
      expect(result.current.phase).toBe('queuing');
      const before = h.state.statusMock.mock.calls.length;

      h.state.statusMock.mockResolvedValue({
        success: true,
        data: {
          inQueue: false,
          queueSize: 0,
          rating: 1250,
          match: { matched: true, battleId: 'battle-missed', slug: 's' },
        },
      });
      await act(async () => {
        socket.connected = true;
        socket.receive('connect', undefined);
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(h.state.statusMock.mock.calls.length).toBe(before + 1);
      expect(result.current.phase).toBe('matched');
      expect(result.current.matchedBattle?.battleId).toBe('battle-missed');
    });

    it('with no socket at all, the status poll still delivers the match', async () => {
      h.state.sessionToken = null; // no socket is ever created
      h.state.joinMock.mockResolvedValueOnce({
        success: true,
        data: { matched: false },
      });
      const { result } = renderHook(() => useMatchmaking());
      await act(async () => {
        await result.current.joinQueue();
      });
      expect(h.state.sockets).toHaveLength(0);
      h.state.statusMock.mockResolvedValue({
        success: true,
        data: {
          inQueue: false,
          queueSize: 0,
          rating: null,
          match: { matched: true, battleId: 'battle-polled' },
        },
      });
      await flush(3000);
      expect(result.current.phase).toBe('matched');
      expect(result.current.matchedBattle?.battleId).toBe('battle-polled');
    });

    it('a match reported by both the socket and status is applied once', async () => {
      h.state.joinMock.mockResolvedValueOnce({
        success: true,
        data: { matched: false },
      });
      const { result, socket } = await mounted();
      await act(async () => {
        await result.current.joinQueue();
      });
      act(() =>
        socket.receive('matchmaking:matched', {
          matched: true,
          battleId: 'battle-first',
        }),
      );
      h.state.statusMock.mockResolvedValue({
        success: true,
        data: {
          inQueue: false,
          queueSize: 0,
          rating: null,
          match: { matched: true, battleId: 'battle-other' },
        },
      });
      await flush(3000);
      expect(result.current.matchedBattle?.battleId).toBe('battle-first');
    });
  });
});
