// eduscale-backend#26-06 — Stripe redirects use one origin, not the whole CORS list.
import { describe, it, expect, jest } from '@jest/globals';

const checkoutCreate = jest.fn<(a: unknown) => Promise<{ url: string }>>(
  async () => ({ url: 'https://stripe/x' })
);
const portalCreate = jest.fn<(a: unknown) => Promise<{ url: string }>>(
  async () => ({ url: 'https://stripe/y' })
);
jest.mock('../../lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: (a: unknown) => checkoutCreate(a) } },
    billingPortal: { sessions: { create: (a: unknown) => portalCreate(a) } },
  },
}));
jest.mock('../../config/env', () => ({
  env: {
    STRIPE_PRO_PRICE_ID: 'price_1',
    CORS_ORIGIN:
      'https://eduscale.vercel.app/, https://staging.app,http://localhost:3000',
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

import {
  createCheckoutSession,
  createPortalSession,
} from '../../services/subscriptionService';

describe('Stripe redirect URLs', () => {
  it('are built from the first CORS origin only', async () => {
    delete process.env.FRONTEND_URL;
    await createCheckoutSession('u1', 'price_1');
    await createPortalSession('u1');
    const checkout = checkoutCreate.mock.calls[0][0] as Record<string, string>;
    const portal = portalCreate.mock.calls[0][0] as Record<string, string>;
    expect(checkout.success_url).toBe(
      'https://eduscale.vercel.app/subscription/success?session_id={CHECKOUT_SESSION_ID}'
    );
    expect(checkout.cancel_url).toBe(
      'https://eduscale.vercel.app/subscription/cancel'
    );
    expect(portal.return_url).toBe(
      'https://eduscale.vercel.app/settings/subscription'
    );
  });
});
