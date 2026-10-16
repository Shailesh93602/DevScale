/**
 * eduscale-backend#23-01 (socket half) — suspension was enforced on REST only.
 *
 * authenticateSocket verified the Supabase token and selected only id,
 * username and avatar_url, so a suspended or deactivated account could still
 * open a WebSocket, join battle rooms and send battle chat.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Socket } from 'socket.io';

const user = {
  id: 'u1',
  username: 'alice',
  avatar_url: null as string | null,
  status: 'active' as string | null,
  is_active: true,
};

jest.mock('../../utils/verifySupabaseToken', () => ({
  verifySupabaseToken: async () => ({ id: 'sb-1' }),
}));
jest.mock('../../services/cacheService', () => ({
  __esModule: true,
  redis: { exists: async () => 0 },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: async ({ select }: { select: Record<string, boolean> }) =>
        Object.fromEntries(
          Object.entries(user).filter(([k]) => select[k as keyof typeof user])
        ),
    },
  },
}));

import { authenticateSocket } from '../../services/realtime/socketHandshake';

const connect = async () => {
  const socket = {
    handshake: { auth: { token: 't' }, query: {} },
    data: {} as { user?: { id: string } },
  };
  let err: Error | undefined;
  await authenticateSocket(socket as unknown as Socket, (e) => {
    err = e as Error | undefined;
  });
  return { err, user: socket.data.user };
};

describe('socket handshake refuses barred accounts', () => {
  beforeEach(() => {
    user.status = 'active';
    user.is_active = true;
  });

  it('lets an active account connect', async () => {
    const out = await connect();
    expect(out.err).toBeUndefined();
    expect(out.user?.id).toBe('u1');
  });

  it('refuses a suspended account', async () => {
    user.status = 'suspended';
    const out = await connect();
    expect(out.err).toBeInstanceOf(Error);
    expect(out.user).toBeUndefined();
  });

  it('refuses a deactivated account', async () => {
    user.is_active = false;
    const out = await connect();
    expect(out.err).toBeInstanceOf(Error);
    expect(out.user).toBeUndefined();
  });
});
