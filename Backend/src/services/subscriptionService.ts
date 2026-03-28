import { stripe } from '../lib/stripe.js';
import SubscriptionRepository from '../repositories/subscriptionRepository.js';
import UserRepository from '../repositories/userRepository.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { createAppError } from '../utils/errorHandler.js';

const subscriptionRepo = new SubscriptionRepository();
const userRepo = new UserRepository();

export async function createCheckoutSession(userId: string, priceId: string) {
  const user = await userRepo.findUnique({ where: { id: userId }, include: { subscription: true } }) as (Awaited<ReturnType<typeof userRepo.findUnique>> & { subscription?: { stripe_customer_id?: string | null } }) | null;
  if (!user) throw createAppError('User not found', 404);

  let stripeCustomerId = user.subscription?.stripe_customer_id;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${env.CORS_ORIGIN}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.CORS_ORIGIN}/subscription/cancel`,
    metadata: { userId },
  });

  return session.url;
}

export async function createPortalSession(userId: string) {
  const user = await userRepo.findUnique({ where: { id: userId }, include: { subscription: true } }) as (Awaited<ReturnType<typeof userRepo.findUnique>> & { subscription?: { stripe_customer_id?: string | null } }) | null;
  if (!user || !user.subscription?.stripe_customer_id) {
    throw createAppError('Stripe customer not found', 404);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripe_customer_id,
    return_url: `${env.CORS_ORIGIN}/settings/subscription`,
  });

  return session.url;
}

export async function handleWebhook(event: any) {
  const { type, data } = event;
  const object = data.object;

  switch (type) {
    case 'checkout.session.completed':
      await _handleCheckoutSessionCompleted(object);
      break;
    case 'customer.subscription.updated':
      await _handleSubscriptionUpdated(object);
      break;
    case 'customer.subscription.deleted':
      await _handleSubscriptionDeleted(object);
      break;
  }
}

async function _handleCheckoutSessionCompleted(session: any) {
  const userId = session.metadata.userId;
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;

  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId) as unknown as {
    items: { data: Array<{ price: { id: string } }> };
    status: string;
    current_period_end: number;
  };
  const priceId = subscription.items.data[0].price.id;

  await subscriptionRepo.upsertSubscription(userId, {
    stripe_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    stripe_price_id: priceId,
    status: subscription.status,
    tier: _getTierFromPrice(priceId),
    end_date: new Date(subscription.current_period_end * 1000),
    user: { connect: { id: userId } }
  });
}

async function _handleSubscriptionUpdated(subscription: any) {
  const stripeId = subscription.id;
  const priceId = subscription.items.data[0].price.id;

  await subscriptionRepo.updateByStripeId(stripeId, {
    status: subscription.status,
    stripe_price_id: priceId,
    tier: _getTierFromPrice(priceId),
    cancel_at_period_end: subscription.cancel_at_period_end,
    end_date: new Date(subscription.current_period_end * 1000),
  });
}

async function _handleSubscriptionDeleted(subscription: any) {
  const stripeId = subscription.id;
  await subscriptionRepo.updateByStripeId(stripeId, {
    status: 'canceled',
    tier: 'free',
  });
}

function _getTierFromPrice(priceId: string): string {
  if (priceId === env.STRIPE_PRO_PRICE_ID) return 'pro';
  if (priceId === env.STRIPE_TEAM_PRICE_ID) return 'team';
  return 'free';
}
