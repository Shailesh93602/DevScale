/**
 * eduscale-backend#22-01 / #24-05 — chat handlers had no participant check.
 *
 * GET /chat returned every chat in the table, GET/DELETE /chat/:id worked on
 * anyone's chat, and POST /chat/create took both participants from the body.
 * Runs the real controller over an in-memory Chat table.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

type Chat = { id: string; user1_id: string; user2_id: string; message: string };
const chats: Chat[] = [];
type Where = { id?: string; OR?: Array<Partial<Chat>> };
const matches = (c: Chat, w: Where = {}) =>
  (w.id === undefined || c.id === w.id) &&
  (!w.OR ||
    w.OR.some((cond) =>
      Object.entries(cond).every(([k, v]) => c[k as keyof Chat] === v)
    ));

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    chat: {
      findMany: async ({ where }: { where?: Where }) =>
        chats.filter((c) => matches(c, where)),
      findFirst: async ({ where }: { where: Where }) =>
        chats.find((c) => matches(c, where)) ?? null,
      findUnique: async ({ where }: { where: Where }) =>
        chats.find((c) => c.id === where.id) ?? null,
      delete: async ({ where }: { where: { id: string } }) => {
        const i = chats.findIndex((c) => c.id === where.id);
        return chats.splice(i, 1)[0];
      },
      create: async ({
        data,
      }: {
        data: {
          message: string;
          user1: { connect: { id: string } };
          user2: { connect: { id: string } };
        };
      }) => {
        const c = {
          id: `c${chats.length + 1}`,
          message: data.message,
          user1_id: data.user1.connect.id,
          user2_id: data.user2.connect.id,
        };
        chats.push(c);
        return c;
      },
    },
  },
}));

import ChatController from '../../controllers/chatControllers';

const controller = new ChatController();
const as = (id: string, extra: Record<string, unknown> = {}) => ({
  user: { id } as never,
  ...extra,
});

beforeEach(() => {
  chats.length = 0;
  chats.push(
    { id: 'mine', user1_id: 'me', user2_id: 'friend', message: 'hi' },
    { id: 'theirs', user1_id: 'alice', user2_id: 'bob', message: 'private' }
  );
});

describe('chat ownership', () => {
  it("GET /chat lists only the caller's chats", async () => {
    const out = await runHandler(controller.getChats, as('me'));
    const ids = ((out.body as { data: Chat[] }).data ?? []).map((c) => c.id);
    expect(ids).toEqual(['mine']);
  });

  it("GET /chat/:id on someone else's chat is a 404", async () => {
    const out = await runHandler(
      controller.getChat,
      as('me', { params: { id: 'theirs' } })
    );
    expect(out.error?.statusCode).toBe(404);
    expect(JSON.stringify(out.body ?? '')).not.toContain('private');
  });

  it("DELETE /chat/delete/:id on someone else's chat deletes nothing", async () => {
    const out = await runHandler(
      controller.deleteChat,
      as('me', { params: { id: 'theirs' } })
    );
    expect(out.error?.statusCode).toBe(404);
    expect(chats.map((c) => c.id)).toContain('theirs');
  });

  it('a participant can still read and delete their own chat', async () => {
    const read = await runHandler(
      controller.getChat,
      as('friend', { params: { id: 'mine' } })
    );
    expect(read.status).toBe(200);
    await runHandler(
      controller.deleteChat,
      as('friend', { params: { id: 'mine' } })
    );
    expect(chats.map((c) => c.id)).not.toContain('mine');
  });

  it('POST /chat/create refuses a chat between two other people', async () => {
    const out = await runHandler(
      controller.createChat,
      as('me', { body: { participants: ['alice', 'bob'] } })
    );
    expect(out.error?.statusCode).toBe(400);
    expect(chats).toHaveLength(2);
  });

  it('POST /chat/create puts the caller on one side', async () => {
    await runHandler(
      controller.createChat,
      as('me', { body: { participants: ['bob', 'me'] } })
    );
    expect(chats[2]).toMatchObject({ user1_id: 'me', user2_id: 'bob' });
  });
});
