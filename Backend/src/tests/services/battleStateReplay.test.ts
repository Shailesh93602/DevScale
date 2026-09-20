/**
 * The client subscribed to an event the server never sent.
 *
 * `battleSocketService.sendStateToSocket` builds a `battle:state` payload —
 * status, current question index, deadline, leaderboard, participants — and
 * emits it to one socket. The battle page subscribes to exactly that event
 * (`Frontend/src/app/battle-zone/[id]/page.tsx`) and `useBattleWebSocket.ts`
 * carries a typed contract for its payload.
 *
 * It had ZERO callers in the entire backend. `grep -rn sendStateToSocket
 * Backend/src` returned its own definition and its own error-log line, nothing
 * else — while a comment in socket.ts claimed the broadcast was "triggered
 * externally by the controller".
 *
 * The user-visible consequence: refresh the page mid-battle, or drop your
 * connection for two seconds, and you rejoin the room and then see nothing —
 * no question, no countdown, no scores — until the NEXT question is broadcast.
 * On the last question of a battle, that is never.
 *
 * This is the repository's own documented lesson repeating: infrastructure
 * existing is not a feature shipped, and a test of an unused helper passes.
 * So this test asserts the WIRING, by driving the real `battle:join` handler.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockSendState = jest.fn<(...a: unknown[]) => Promise<void>>();
const mockCanObserve = jest.fn<(...a: unknown[]) => Promise<unknown>>();

jest.mock('../../services/battleSocket', () => ({
  __esModule: true,
  default: {
    sendStateToSocket: (...a: unknown[]) => mockSendState(...a),
  },
}));

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    battle: { findUnique: (...a: unknown[]) => mockCanObserve(...a) },
  },
}));

import socketService from '../../services/socket';

const BATTLE_ID = 'battle-42';
const USER_ID = 'user-7';

/** The narrow slice of a Socket.io socket the join handler touches. */
function fakeSocket() {
  return {
    id: 'socket-abc',
    data: { user: { id: USER_ID, username: 'player' } },
    join: jest.fn(),
    emit: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() })),
  };
}

/** Reach the private handler the same way the runtime does. */
const joinRoom = (socket: unknown, userId: string, battleId: string) =>
  (
    socketService as unknown as {
      joinBattleRoom(s: unknown, u: string, b: string): Promise<boolean>;
    }
  ).joinBattleRoom(socket, userId, battleId);

beforeEach(() => {
  jest.clearAllMocks();
  mockSendState.mockResolvedValue(undefined);
});

describe('battle room join — the joiner is told what is going on', () => {
  it('reports success so the caller knows to replay state', async () => {
    mockCanObserve.mockResolvedValue({
      status: 'IN_PROGRESS',
      user_id: USER_ID,
      participants: [{ id: 'p1' }],
    });

    const socket = fakeSocket();
    const joined = await joinRoom(socket, USER_ID, BATTLE_ID);

    expect(joined).toBe(true);
    expect(socket.join).toHaveBeenCalledWith(`battle:${BATTLE_ID}`);
  });

  it('reports failure — and no state is replayed to someone refused the room', async () => {
    mockCanObserve.mockResolvedValue({
      status: 'IN_PROGRESS',
      user_id: 'somebody-else',
      participants: [],
    });

    const socket = fakeSocket();
    const joined = await joinRoom(socket, USER_ID, BATTLE_ID);

    expect(joined).toBe(false);
    expect(socket.join).not.toHaveBeenCalled();
    expect(mockSendState).not.toHaveBeenCalled();
  });
});

describe('sendStateToSocket is reachable from the join path', () => {
  it('socket.ts wires battle:join to the state replay', async () => {
    // The defect was structural — a function with no callers — so assert the
    // edge exists rather than the text of the file. Registering the real
    // handlers and firing `battle:join` is what proves it.
    const handlers = new Map<string, (data: unknown) => void>();
    const socket = {
      ...fakeSocket(),
      on: (event: string, cb: (data: unknown) => void) => {
        handlers.set(event, cb);
      },
    };

    mockCanObserve.mockResolvedValue({
      status: 'IN_PROGRESS',
      user_id: USER_ID,
      participants: [{ id: 'p1' }],
    });

    const io = {
      on: (_event: string, cb: (s: unknown) => void) => cb(socket),
      use: jest.fn(),
    };
    (socketService as unknown as { io: unknown }).io = io;
    (
      socketService as unknown as { setupEventHandlers(): void }
    ).setupEventHandlers();

    const joinHandler = handlers.get('battle:join');
    expect(joinHandler).toBeDefined();

    joinHandler?.({ battle_id: BATTLE_ID });

    // The handler chains through two awaits and a dynamic import.
    await new Promise((r) => setTimeout(r, 30));

    expect(mockSendState).toHaveBeenCalledWith('socket-abc', BATTLE_ID);
  });
});
