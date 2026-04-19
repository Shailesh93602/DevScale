import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ─── Mock Redis ────────────────────────────────────────────────────────────────
jest.mock('../../services/cacheService', () => ({
  redis: {
    setex: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
    exists: jest.fn(),
    call: jest.fn(),
    status: 'ready',
    quit: jest.fn(),
  },
}));

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    subscription: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    user: { findUnique: jest.fn() },
    $disconnect: jest.fn(),
  },
}));

// ─── Mock Logger ───────────────────────────────────────────────────────────────
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// ─── Mock Stripe ───────────────────────────────────────────────────────────────
const mockCustomersCreate = jest.fn();
const mockCheckoutSessionsCreate = jest.fn();
const mockBillingPortalSessionsCreate = jest.fn();
const mockSubscriptionsRetrieve = jest.fn();

jest.mock('../../lib/stripe', () => ({
  stripe: {
    customers: { create: mockCustomersCreate },
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
    subscriptions: { retrieve: mockSubscriptionsRetrieve },
  },
}));

// ─── Mock env ──────────────────────────────────────────────────────────────────
jest.mock('../../config/env', () => ({
  env: {
    CORS_ORIGIN: 'http://localhost:3000',
    STRIPE_PRO_PRICE_ID: 'price_pro_123',
    STRIPE_TEAM_PRICE_ID: 'price_team_456',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
  },
}));

// ─── Mock Repositories ─────────────────────────────────────────────────────────
const mockUpsertSubscription = jest.fn();
const mockUpdateByStripeId = jest.fn();
jest.mock('../../repositories/subscriptionRepository', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    upsertSubscription: mockUpsertSubscription,
    updateByStripeId: mockUpdateByStripeId,
  })),
}));

const mockUserFindUnique = jest.fn();
jest.mock('../../repositories/userRepository', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    findUnique: mockUserFindUnique,
  })),
}));

import {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
} from '../../services/subscriptionService';

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── createCheckoutSession ─────────────────────────────────────────────────
  describe('createCheckoutSession', () => {
    it('should create a new Stripe customer if none exists and return URL', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@eduscale.com',
        first_name: 'Test',
        last_name: 'User',
        subscription: null,
      } as never);

      mockCustomersCreate.mockResolvedValue({ id: 'cus_new_123' } as never);
      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session_abc',
      } as never);

      const url = await createCheckoutSession('user-123', 'price_pro_123');

      expect(mockCustomersCreate).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@eduscale.com' })
      );
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_new_123',
          mode: 'subscription',
        })
      );
      expect(url).toBe('https://checkout.stripe.com/session_abc');
    });

    it('should reuse existing Stripe customer ID', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@eduscale.com',
        first_name: 'Test',
        last_name: 'User',
        subscription: { stripe_customer_id: 'cus_existing_789' },
      } as never);

      mockCheckoutSessionsCreate.mockResolvedValue({
        url: 'https://checkout.stripe.com/session_xyz',
      } as never);

      const url = await createCheckoutSession('user-123', 'price_pro_123');

      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing_789' })
      );
      expect(url).toBe('https://checkout.stripe.com/session_xyz');
    });

    it('should throw 404 when user is not found', async () => {
      mockUserFindUnique.mockResolvedValue(null as never);

      await expect(
        createCheckoutSession('nonexistent', 'price_pro_123')
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── createPortalSession ───────────────────────────────────────────────────
  describe('createPortalSession', () => {
    it('should create a billing portal session and return URL', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        subscription: { stripe_customer_id: 'cus_456' },
      } as never);

      mockBillingPortalSessionsCreate.mockResolvedValue({
        url: 'https://billing.stripe.com/portal_abc',
      } as never);

      const url = await createPortalSession('user-123');

      expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_456' })
      );
      expect(url).toBe('https://billing.stripe.com/portal_abc');
    });

    it('should throw 404 when user has no Stripe customer', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 'user-123',
        subscription: null,
      } as never);

      await expect(createPortalSession('user-123')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ── handleWebhook ─────────────────────────────────────────────────────────
  describe('handleWebhook', () => {
    it('should handle checkout.session.completed and upsert subscription', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user-123' },
            subscription: 'sub_123',
            customer: 'cus_456',
          },
        },
      };

      mockSubscriptionsRetrieve.mockResolvedValue({
        items: { data: [{ price: { id: 'price_pro_123' } }] },
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
      } as never);

      mockUpsertSubscription.mockResolvedValue({} as never);

      await handleWebhook(event as unknown as import('stripe').default.Event);

      expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith('sub_123');
      expect(mockUpsertSubscription).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          stripe_id: 'sub_123',
          stripe_customer_id: 'cus_456',
          tier: 'pro',
        })
      );
    });

    it('should handle customer.subscription.updated', async () => {
      const event = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            items: { data: [{ price: { id: 'price_team_456' } }] },
            status: 'active',
            cancel_at_period_end: false,
            current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
          },
        },
      };

      mockUpdateByStripeId.mockResolvedValue({} as never);

      await handleWebhook(event as unknown as import('stripe').default.Event);

      expect(mockUpdateByStripeId).toHaveBeenCalledWith(
        'sub_123',
        expect.objectContaining({
          tier: 'team',
          status: 'active',
        })
      );
    });

    it('should handle customer.subscription.deleted', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: { id: 'sub_123' },
        },
      };

      mockUpdateByStripeId.mockResolvedValue({} as never);

      await handleWebhook(event as unknown as import('stripe').default.Event);

      expect(mockUpdateByStripeId).toHaveBeenCalledWith(
        'sub_123',
        expect.objectContaining({
          status: 'canceled',
          tier: 'free',
        })
      );
    });

    it('should do nothing for unhandled event types', async () => {
      const event = {
        type: 'invoice.payment_failed',
        data: { object: {} },
      };

      await handleWebhook(event as unknown as import('stripe').default.Event);

      expect(mockUpsertSubscription).not.toHaveBeenCalled();
      expect(mockUpdateByStripeId).not.toHaveBeenCalled();
    });
  });
});
