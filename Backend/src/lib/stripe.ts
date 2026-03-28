import Stripe from 'stripe';
import { env } from '../config/env.js';

if (!env.STRIPE_SECRET_KEY) {
  console.warn('[WARN] STRIPE_SECRET_KEY is missing. Billing features will fail.');
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24-preview', // Or latest
  typescript: true,
});
