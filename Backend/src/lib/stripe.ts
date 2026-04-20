import Stripe from 'stripe';
import { env } from '../config/env.js';

// Stripe SDK throws at construction if apiKey is empty ("Neither apiKey nor
// config.authenticator provided"). Since STRIPE_SECRET_KEY is declared optional
// in env.ts, instantiating eagerly crashes the whole process on boot whenever
// billing isn't configured — which is the majority of preview/dev deployments.
//
// Lazy-instantiate instead: the first billing code path that calls getStripe()
// either returns a configured client or throws a clear 503-worthy error.
let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error(
      'Stripe is not configured: STRIPE_SECRET_KEY is missing. Billing endpoints should gate on this before calling getStripe().'
    );
  }
  stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  });
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(env.STRIPE_SECRET_KEY);
}

/**
 * @deprecated import { getStripe } and call it at request time instead —
 *             the eager `stripe` export crashes boot when the key is missing.
 *             Kept as a lazy proxy so existing callers don't break, but new
 *             code should use getStripe().
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const real = getStripe() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
