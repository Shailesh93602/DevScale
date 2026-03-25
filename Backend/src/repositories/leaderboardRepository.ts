import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export default class LeaderboardRepository extends BaseRepository<
  PrismaClient['leaderboardEntry']
> {
  constructor() {
    super(prisma.leaderboardEntry);
  }
  async getLeaderboard(subject_id: string, time_range: string, limit: number) {
    const time_filter = this.getTimeFilter(time_range);

    return this.findMany({
      where: {
        subject_id: subject_id,
        created_at: time_filter,
      },
      orderBy: [{ score: 'desc' }, { time_taken: 'asc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  private getTimeFilter(timeRange: string) {
    const now = new Date();
    const filters: Record<string, { gte: Date }> = {
      daily: { gte: new Date(now.setDate(now.getDate() - 1)) },
      weekly: { gte: new Date(now.setDate(now.getDate() - 7)) },
      monthly: { gte: new Date(now.setMonth(now.getMonth() - 1)) },
      all: { gte: new Date(0) },
    };

    return filters[timeRange];
  }
}
