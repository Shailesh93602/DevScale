import { Prisma, Subscription } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';

export default class SubscriptionRepository extends BaseRepository<
  Subscription,
  typeof prisma.subscription
> {
  constructor() {
    super(prisma.subscription);
  }

  async findByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<Subscription | null> {
    return this.findUnique({
      where: { stripe_customer_id: stripeCustomerId },
    });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.findUnique({
      where: { user_id: userId },
    });
  }

  async findByStripeId(stripeId: string): Promise<Subscription | null> {
    return this.findUnique({
      where: { stripe_id: stripeId },
    });
  }

  async updateByStripeId(
    stripeId: string,
    data: Prisma.SubscriptionUpdateInput
  ): Promise<Subscription> {
    return this.update({
      where: { stripe_id: stripeId },
      data,
    });
  }

  async upsertSubscription(
    userId: string,
    data: Prisma.SubscriptionCreateInput
  ): Promise<Subscription> {
    return this.upsert({
      where: { user_id: userId },
      update: {
        ...data,
      },
      create: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }
}
