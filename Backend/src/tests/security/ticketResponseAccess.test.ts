/**
 * eduscale-backend#22-05 / #24-03 — anyone could reply on anyone's ticket.
 *
 * POST /support/tickets/:ticketId/responses needed only authentication, took
 * `isInternal` from the body, and returned the ticket owner's email in the
 * reply. Only the owner or staff (tickets:update) may reply now, and only
 * staff may write an internal note.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const responses: Array<{
  data: Record<string, unknown>;
  include?: unknown;
}> = [];
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    supportTicket: {
      findUnique: async ({ where }: { where: { id: string } }) =>
        where.id === 'ticket-1' ? { user_id: 'owner' } : null,
    },
    ticketResponse: {
      create: async (args: {
        data: Record<string, unknown>;
        include?: unknown;
      }) => {
        responses.push(args);
        return { id: 'r1', ...args.data };
      },
    },
  },
}));
const staff = new Set(['agent']);
jest.mock('../../services/permissionService', () => ({
  canDo: async (userId: string) => staff.has(userId),
}));

import SupportController from '../../controllers/supportController';

const reply = (userId: string, body: Record<string, unknown>) =>
  runHandler(new SupportController().addTicketResponse, {
    params: { ticketId: 'ticket-1' },
    body,
    user: { id: userId } as never,
  });

describe('ticket replies', () => {
  beforeEach(() => {
    responses.length = 0;
  });

  it("a stranger cannot reply on someone else's ticket", async () => {
    const out = await reply('stranger', { content: 'hi' });
    expect(out.error?.statusCode).toBe(404);
    expect(responses).toHaveLength(0);
  });

  it('the owner can reply, but cannot write an internal note', async () => {
    const out = await reply('owner', {
      content: 'still broken',
      isInternal: true,
    });
    expect(out.error).toBeUndefined();
    expect(responses[0].data).toMatchObject({
      user_id: 'owner',
      is_internal: false,
    });
  });

  it('staff can write an internal note on any ticket', async () => {
    await reply('agent', { content: 'escalating', isInternal: true });
    expect(responses[0].data).toMatchObject({ is_internal: true });
  });

  it("the reply does not carry the ticket owner's email", async () => {
    await reply('owner', { content: 'x' });
    expect(JSON.stringify(responses[0].include ?? {})).not.toContain('email');
  });
});
