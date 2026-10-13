import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

type Handler = (data: unknown) => void;

const h = vi.hoisted(() => {
  const makeSocket = () => {
    const listeners = new Map<string, Set<Handler>>();
    return {
      connected: true,
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

import { useMatchmaking } from './useMatchmaking';

describe('useMatchmaking', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    h.state.sockets.length = 0;
    h.state.sessionToken = 'test-token';
    h.state.joinMock.mockReset();
    h.state.leaveMock.mockReset();
    h.state.statusMock.mockReset();

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
});
