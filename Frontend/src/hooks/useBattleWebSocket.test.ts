import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * The battle page registers its socket handlers in a mount effect — before
 * the socket exists, because the socket is created only after the auth token
 * resolves. `on()` used to attach to `socketRef.current` synchronously, which
 * was `null` at that moment, so every handler was dropped and the page never
 * reacted to battle:started / battle:question / battle:completed. The frames
 * did reach the browser (verified with a WebSocket-frame probe against a
 * production build: `battle:started` arrived within 10 ms of the HTTP 200, and
 * 25 s later both players' pages still showed the lobby).
 *
 * This test drives that exact order — register first, resolve the token
 * later, deliver a frame — and requires the handler to fire. It fails against
 * the previous implementation.
 */

type Handler = (data: unknown) => void;

const h = vi.hoisted(() => {
  const makeSocket = () => {
    const listeners = new Map<string, Set<Handler>>();
    return {
      connected: false,
      disconnects: 0,
      on: (event: string, fn: Handler) => {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event)!.add(fn);
      },
      off: (event: string, fn: Handler) => {
        listeners.get(event)?.delete(fn);
      },
      emit: () => {},
      disconnect() {
        this.disconnects++;
      },
      /** Test-only: deliver a frame the way the server would. */
      receive(event: string, data: unknown) {
        for (const fn of listeners.get(event) ?? []) fn(data);
      },
      listenerCount(event: string) {
        return listeners.get(event)?.size ?? 0;
      },
    };
  };
  type FakeSocket = ReturnType<typeof makeSocket>;
  const state = {
    sockets: [] as FakeSocket[],
    // Replaced per test; defaults to an already-resolved token.
    session: (): Promise<string | null> => Promise.resolve('token'),
  };
  return { makeSocket, state };
});

vi.mock('socket.io-client', () => ({
  io: (_url: string, opts: { auth?: unknown }) => {
    const s = Object.assign(h.makeSocket(), { opts });
    h.state.sockets.push(s);
    return s;
  },
}));

vi.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: () =>
        h.state.session().then((token) => ({
          data: { session: token ? { access_token: token } : null },
        })),
    },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: () => {} }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, userId: null }),
}));

import { RELEASE_GRACE_MS, useBattleSocket } from './useBattleWebSocket';

// The hook keeps one socket per battle id in a module-level map, so every
// test uses a fresh id.
let n = 0;
const freshBattleId = () => `battle-${++n}`;
const latestSocket = () => h.state.sockets[h.state.sockets.length - 1];

/** Two microtask turns: getSession().then(...) then getAuthToken().then(...). */
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

beforeEach(() => {
  h.state.sockets.length = 0;
  h.state.session = () => Promise.resolve('token');
});

describe('useBattleSocket.on', () => {
  it('delivers events to a handler registered BEFORE the socket exists (the mount-effect order)', async () => {
    let release: (token: string | null) => void = () => {};
    h.state.session = () =>
      new Promise<string | null>((resolve) => {
        release = resolve;
      });

    const { result } = renderHook(() => useBattleSocket(freshBattleId()));

    // Mount-time registration: the token has NOT resolved, there is no socket.
    const started = vi.fn();
    let off: () => void = () => {};
    act(() => {
      off = result.current.on('battle:started', started);
    });
    expect(latestSocket()).toBeUndefined();

    // Token resolves → socket is created → the queued handler is attached.
    release('token-1');
    await settle();
    const socket = latestSocket();
    expect(socket).toBeDefined();
    expect(socket.listenerCount('battle:started')).toBe(1);

    // A frame from the server now reaches the handler.
    act(() => {
      socket.receive('battle:started', { started_at: 123 });
    });
    expect(started).toHaveBeenCalledWith({ started_at: 123 });

    // And the returned cleanup detaches it.
    act(() => off());
    expect(socket.listenerCount('battle:started')).toBe(0);
  });

  it('a handler unregistered before the socket exists is never attached', async () => {
    let release: (token: string | null) => void = () => {};
    h.state.session = () =>
      new Promise<string | null>((resolve) => {
        release = resolve;
      });

    const { result } = renderHook(() => useBattleSocket(freshBattleId()));
    const handler = vi.fn();
    let off: () => void = () => {};
    act(() => {
      off = result.current.on('battle:question', handler);
    });
    act(() => off());

    release('token-2');
    await settle();
    const socket = latestSocket();
    expect(socket.listenerCount('battle:question')).toBe(0);
    act(() => {
      socket.receive('battle:question', { index: 0 });
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('still attaches immediately once the socket exists', async () => {
    const { result } = renderHook(() => useBattleSocket(freshBattleId()));
    await settle();
    const socket = latestSocket();
    expect(socket).toBeDefined();

    const completed = vi.fn();
    act(() => {
      result.current.on('battle:completed', completed);
    });
    expect(socket.listenerCount('battle:completed')).toBe(1);
    act(() => {
      socket.receive('battle:completed', { winner_id: 'u1', leaderboard: [] });
    });
    expect(completed).toHaveBeenCalledTimes(1);
  });
});

describe('useBattleSocket handshake auth', () => {
  it('reads the CURRENT token on every handshake, not the one from creation', async () => {
    h.state.session = () => Promise.resolve('token-at-creation');
    renderHook(() => useBattleSocket(freshBattleId()));
    await settle();
    const { auth } = (latestSocket() as unknown as { opts: { auth?: unknown } })
      .opts;
    expect(typeof auth).toBe('function');

    // The access token refreshes (~hourly); a reconnect must carry the new one.
    h.state.session = () => Promise.resolve('token-after-refresh');
    const sent = await new Promise((resolve) =>
      (auth as (cb: (data: object) => void) => void)(resolve),
    );
    expect(sent).toEqual({ token: 'token-after-refresh' });
  });
});

describe('useBattleSocket lifetime', () => {
  afterEach(() => vi.useRealTimers());

  it('closes the socket once the last holder (the lobby) unmounts', async () => {
    vi.useFakeTimers();
    const id = freshBattleId();
    // The lobby mounts three holders: BattleLobby, BattleChat, ParticipantList.
    const lobby = [1, 2, 3].map(() => renderHook(() => useBattleSocket(id)));
    await settle();
    expect(h.state.sockets).toHaveLength(1);
    const socket = latestSocket();

    lobby[0].unmount();
    lobby[1].unmount();
    act(() => vi.advanceTimersByTime(RELEASE_GRACE_MS));
    expect(socket.disconnects).toBe(0);

    lobby[2].unmount();
    act(() => vi.advanceTimersByTime(RELEASE_GRACE_MS));
    expect(socket.disconnects).toBe(1);
    expect(socket.listenerCount('connect')).toBe(1); // only getSocket's join
    expect(socket.listenerCount('disconnect')).toBe(0);
  });

  it('keeps one connection from the lobby into the battle page', async () => {
    vi.useFakeTimers();
    const id = freshBattleId();
    const lobby = renderHook(() => useBattleSocket(id));
    await settle();
    const socket = latestSocket();

    lobby.unmount();
    act(() => vi.advanceTimersByTime(RELEASE_GRACE_MS - 1));
    const battle = renderHook(() => useBattleSocket(id));
    await settle();
    act(() => vi.advanceTimersByTime(RELEASE_GRACE_MS * 2));

    expect(h.state.sockets).toHaveLength(1);
    expect(socket.disconnects).toBe(0);
    expect(battle.result.current.socket.current).toBe(socket);
    expect(socket.listenerCount('disconnect')).toBe(1);
  });

  it('does not pile listeners up across visits', async () => {
    const id = freshBattleId();
    for (let i = 0; i < 3; i++) {
      const visit = renderHook(() => useBattleSocket(id));
      await settle();
      visit.unmount();
    }
    const socket = latestSocket();
    expect(h.state.sockets).toHaveLength(1);
    expect(socket.listenerCount('disconnect')).toBe(0);
    expect(socket.listenerCount('connect_error')).toBe(0);
  });
});
