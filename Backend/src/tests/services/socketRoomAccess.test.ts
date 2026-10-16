/**
 * eduscale-backend#26-04 — the battle-room guard failed open.
 *
 * Any error in canObserveBattle (a DB blip) returned true, so the caller was
 * joined to `battle:<id>` and recorded as a member, which chat then trusts.
 */
import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    battle: {
      findUnique: async () => {
        throw new Error('connection reset');
      },
    },
  },
}));

import socketService, { SocketEvents } from '../../services/socket';

describe('battle room access when the check errors', () => {
  it('refuses the join and tells the client to retry', async () => {
    const handlers = new Map<string, (d: unknown) => void>();
    let onConnect: ((s: unknown) => void) | undefined;
    const svc = socketService as unknown as {
      io: unknown;
      setupEventHandlers: () => void;
    };
    svc.io = {
      on: (e: string, cb: (s: unknown) => void) => {
        if (e === SocketEvents.CONNECT) onConnect = cb;
      },
    };
    svc.setupEventHandlers();

    const joined: string[] = [];
    const emitted: Array<[string, unknown]> = [];
    onConnect?.({
      id: 'sock-1',
      data: { user: { id: 'outsider' } },
      on: (e: string, h: (d: unknown) => void) => handlers.set(e, h),
      emit: (e: string, payload: unknown) => emitted.push([e, payload]),
      join: (room: string) => joined.push(room),
      leave: () => undefined,
    });

    handlers.get(SocketEvents.BATTLE_JOIN)?.({ battle_id: 'live-battle' });
    await new Promise((r) => setTimeout(r, 20));

    expect(joined).toEqual([]);
    expect(emitted).toEqual([
      [SocketEvents.ERROR, expect.objectContaining({ retryable: true })],
    ]);
    svc.io = null;
  });
});
