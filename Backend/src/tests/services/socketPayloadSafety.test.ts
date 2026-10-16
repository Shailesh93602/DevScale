/**
 * eduscale-backend#26-01 — one malformed socket event could kill the process.
 *
 * Handlers read `data.battle_id` synchronously (a null payload threw inside
 * socket.io's nextTick -> uncaughtException) and handleChatMessage's promise
 * was neither awaited nor caught (`message.trim()` on a number ->
 * unhandledRejection). main.ts answers both with process.exit(1). This wires
 * the real handlers to a fake socket and fires the hostile payloads.
 */
import { describe, it, expect, afterEach } from '@jest/globals';
import socketService, { SocketEvents } from '../../services/socket';

type Handler = (data?: unknown) => unknown;

function connectFakeSocket() {
  const handlers = new Map<string, Handler>();
  let onConnect: ((socket: unknown) => void) | undefined;
  const fakeIo = {
    on: (event: string, cb: (socket: unknown) => void) => {
      if (event === SocketEvents.CONNECT) onConnect = cb;
    },
  };
  const svc = socketService as unknown as {
    io: unknown;
    setupEventHandlers: () => void;
  };
  svc.io = fakeIo;
  svc.setupEventHandlers();
  onConnect?.({
    id: 'sock-1',
    data: { user: { id: 'u1', username: 'u1' } },
    on: (event: string, h: Handler) => handlers.set(event, h),
    emit: () => true,
    join: () => undefined,
    leave: () => undefined,
    disconnect: () => undefined,
  });
  return handlers;
}

const rejections: unknown[] = [];
const onRejection = (r: unknown) => rejections.push(r);

afterEach(() => {
  process.off('unhandledRejection', onRejection);
  (socketService as unknown as { io: unknown }).io = null;
});

describe('socket handlers survive hostile payloads', () => {
  const hostile: Array<[string, string, unknown]> = [
    [
      'numeric chat message',
      SocketEvents.CHAT_MESSAGE,
      { battle_id: 'b1', message: 1 },
    ],
    ['null chat payload', SocketEvents.CHAT_MESSAGE, null],
    ['null join payload', SocketEvents.BATTLE_JOIN, null],
    ['numeric battle_id on join', SocketEvents.BATTLE_JOIN, { battle_id: 42 }],
    ['missing leave payload', SocketEvents.BATTLE_LEAVE, undefined],
  ];

  it.each(hostile)(
    '%s neither throws nor leaves an unhandled rejection',
    async (_label, event, payload) => {
      process.on('unhandledRejection', onRejection);
      rejections.length = 0;
      const handlers = connectFakeSocket();
      const handler = handlers.get(event);
      expect(handler).toBeDefined();

      expect(() => handler!(payload)).not.toThrow();
      // Let any floating promise settle and report.
      await new Promise((r) => setTimeout(r, 20));
      expect(rejections).toEqual([]);
    }
  );
});
