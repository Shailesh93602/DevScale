import express, { Router } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
} from '../services/subscriptionService.js';
import { stripe } from '../lib/stripe.js';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';
import { authMiddleware as authenticate } from '../middlewares/authMiddleware.js';
import Stripe from 'stripe';

export class SubscriptionRoutes {
  private readonly router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // PUBLIC Webhook (Uses raw body)
    this.router.post(
      '/stripe/webhook',
      express.raw({ type: 'application/json' }),
      async (req, res) => {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            env.STRIPE_WEBHOOK_SECRET || ''
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          logger.error(`[Stripe Webhook Error] ${message}`);
          return res.status(400).send(`Webhook Error: ${message}`);
        }

        try {
          await handleWebhook(event);
          res.json({ received: true });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          logger.error(`[Stripe Webhook Processing Error] ${message}`);
          res.status(500).send('Internal Server Error');
        }
      }
    );

    // PROTECTED Routes
    this.router.post('/checkout', authenticate, async (req, res) => {
      try {
        const { priceId } = req.body;
        const url = await createCheckoutSession(req.user.id, priceId);
        res.json({ url });
      } catch (err) {
        const error = err as { status?: number; message: string };
        res.status(error.status || 500).json({ message: error.message });
      }
    });

    this.router.post('/portal', authenticate, async (req, res) => {
      try {
        const url = await createPortalSession(req.user.id);
        res.json({ url });
      } catch (err) {
        const error = err as { status?: number; message: string };
        res.status(error.status || 500).json({ message: error.message });
      }
    });
  }

  public getRouter(): Router {
    return this.router;
  }
}
