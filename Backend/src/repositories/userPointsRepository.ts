import BaseRepository from './baseRepository.js';
import type { UserPoints } from '@prisma/client';

import prisma from '../lib/prisma.js';

export default class UserPointsRepository extends BaseRepository< UserPoints, typeof prisma.userPoints > {
  constructor() {
    // Pass the Prisma delegate for the user model (prisma.user)
    super(prisma.userPoints);
  }

  async getUserPoints(user_id: string) {
    const points = await this.findMany({
      where: { user_id },
    });

    return points;
  }

  // Update user points
  async updateUserPoints(user_id: string, points: number): Promise<void> {
    await this.upsert({
      where: { user_id },
      update: { points: { increment: points } },
      create: { user_id, points },
    });
  }
}
