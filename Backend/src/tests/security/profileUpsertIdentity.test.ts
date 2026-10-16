/**
 * eduscale-backend#22-06 / #24-02 — PUT /users/me let the body pick the row.
 *
 * userInsertionSchema allows `id` and `email`, and the controller spread the
 * body AFTER the session's id/email, so `{ id: 'victim' }` chose which row
 * was upserted and `email` set an unverified address.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const upserts: Array<{
  where: { id: string };
  update: Record<string, unknown>;
}> = [];
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findFirst: async () => null,
      upsert: async (args: {
        where: { id: string };
        update: Record<string, unknown>;
      }) => {
        upserts.push(args);
        return { id: args.where.id };
      },
    },
  },
}));

import UserController from '../../controllers/userControllers';

describe('PUT /users/me', () => {
  it("upserts the session user's row with the session email, whatever the body says", async () => {
    const out = await runHandler(new UserController().upsertUser, {
      headers: {},
      body: {
        id: 'victim',
        email: 'attacker@example.com',
        username: 'someone',
        first_name: 'Some',
        last_name: 'One',
      },
      user: {
        id: 'me',
        supabase_id: 'sb-me',
        email: 'me@example.com',
      } as never,
    });
    expect(out.error).toBeUndefined();
    expect(upserts[0].where.id).toBe('me');
    expect(upserts[0].update).toMatchObject({
      id: 'me',
      email: 'me@example.com',
      supabase_id: 'sb-me',
      username: 'someone',
    });
  });
});
