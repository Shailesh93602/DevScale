// POST /billing/checkout must only start a Stripe session for a price the server configured.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import type { AddressInfo } from 'node:net';

const mockCheckoutCreate = jest.fn<(a: unknown) => Promise<{ url: string }>>(
  async () => ({ url: 'https://checkout.stripe.com/s' })
);
const mockEnv: Record<string, string | undefined> = {
  CORS_ORIGIN: 'https://eduscale.vercel.app',
};

jest.mock('../../config/env', () => ({ env: mockEnv }));
jest.mock('../../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: (a: unknown) => mockCheckoutCreate(a) } },
  },
}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: async () => ({
        id: 'u1',
        email: 'a@b.c',
        subscription: { stripe_customer_id: 'cus_1' },
      }),
    },
    subscription: {},
  },
}));
jest.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (
    req: { user?: unknown },
    _res: unknown,
    next: () => void
  ) => {
    req.user = { id: 'u1' };
    next();
  },
}));
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { SubscriptionRoutes } from '../../routes/subscriptionRoutes';

async function postCheckout(body: unknown) {
  const a = express();
  a.use(express.json());
  a.use('/billing', new SubscriptionRoutes().getRouter());
  const server = a.listen(0);
  try {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/billing/checkout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return {
      status: res.status,
      body: (await res.json()) as Record<string, string>,
    };
  } finally {
    server.close();
  }
}

describe('POST /billing/checkout price allow-list', () => {
  beforeEach(() => {
    mockCheckoutCreate.mockClear();
    mockEnv.STRIPE_PRO_PRICE_ID = 'price_pro';
    mockEnv.STRIPE_TEAM_PRICE_ID = 'price_team';
  });

  it('refuses a price id the server did not configure, without calling Stripe', async () => {
    const res = await postCheckout({ priceId: 'price_attacker_0cents' });
    expect(res.status).toBe(400);
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('refuses a missing or non-string price id', async () => {
    expect((await postCheckout({})).status).toBe(400);
    expect((await postCheckout({ priceId: ['price_pro'] })).status).toBe(400);
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('answers 503 when no paid plan is configured, even for an empty-string match', async () => {
    mockEnv.STRIPE_PRO_PRICE_ID = '';
    delete mockEnv.STRIPE_TEAM_PRICE_ID;
    const res = await postCheckout({ priceId: '' });
    expect(res.status).toBe(503);
    expect(res.body.message).toMatch(/billing is not available/i);
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('starts a session for each configured plan price', async () => {
    for (const priceId of ['price_pro', 'price_team']) {
      const res = await postCheckout({ priceId });
      expect(res.status).toBe(200);
      expect(res.body.url).toBe('https://checkout.stripe.com/s');
    }
    const prices = mockCheckoutCreate.mock.calls.map(
      ([arg]) =>
        (arg as { line_items: { price: string }[] }).line_items[0].price
    );
    expect(prices).toEqual(['price_pro', 'price_team']);
  });
});
