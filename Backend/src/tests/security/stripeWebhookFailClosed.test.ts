import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import type { AddressInfo } from 'node:net';

const mockConstructEvent = jest.fn();
const mockHandleWebhook = jest.fn();
const mockEnv: { STRIPE_WEBHOOK_SECRET?: string } = {};

jest.mock('../../config/env', () => ({ env: mockEnv }));
jest.mock('../../lib/stripe', () => ({
  stripe: { webhooks: { constructEvent: mockConstructEvent } },
}));
jest.mock('../../services/subscriptionService', () => ({
  createCheckoutSession: jest.fn(),
  createPortalSession: jest.fn(),
  handleWebhook: mockHandleWebhook,
}));
jest.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: jest.fn(),
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

async function postWebhook(signature: string): Promise<number> {
  const a = express();
  a.use('/subscription', new SubscriptionRoutes().getRouter());
  const server = a.listen(0);
  try {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(
      `http://127.0.0.1:${port}/subscription/stripe/webhook`,
      {
        method: 'POST',
        headers: {
          'stripe-signature': signature,
          'content-type': 'application/json',
        },
        body: '{}',
      }
    );
    return res.status;
  } finally {
    server.close();
  }
}

describe('Stripe webhook signature check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete mockEnv.STRIPE_WEBHOOK_SECRET;
  });

  it('refuses every event when STRIPE_WEBHOOK_SECRET is unset, without trying to verify it', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
    });

    const status = await postWebhook('t=1,v1=forged');

    expect(status).toBe(503);
    expect(mockConstructEvent).not.toHaveBeenCalled();
    expect(mockHandleWebhook).not.toHaveBeenCalled();
  });

  it('verifies with the configured secret when it is set', async () => {
    mockEnv.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    mockConstructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
    });

    const status = await postWebhook('t=1,v1=sig');

    expect(status).toBe(200);
    expect(mockConstructEvent).toHaveBeenCalledWith(
      expect.anything(),
      't=1,v1=sig',
      'whsec_test'
    );
    expect(mockHandleWebhook).toHaveBeenCalledTimes(1);
  });
});
