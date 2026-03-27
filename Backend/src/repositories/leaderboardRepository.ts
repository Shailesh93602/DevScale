import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';
import prisma from '../lib/prisma';
import { getOrSetCache, deleteCache } from '../services/cacheService';

const LEADERBOARD_TTL = 60; // 60 seconds — leaderboard is high-read, tolerates 1-min staleness
const cacheKey = (subjectId: string, timeRange: string, limit: number) =>
  `eduscale:leaderboard:${subjectId}:${timeRange}:${limit}`;

export default class LeaderboardRepository extends BaseRepository<
  PrismaClient['leaderboardEntry']
> {
  constructor() {
    super(prisma.leaderboardEntry);
  }

  async getLeaderboard(subject_id: string, time_range: string, limit: number) {
    const key = cacheKey(subject_id, time_range, limit);
    return getOrSetCache(
      key,
      () => this._queryLeaderboard(subject_id, time_range, limit),
      { ttl: LEADERBOARD_TTL },
    );
  }

  /** Call after any score write to keep the leaderboard fresh. */
  async invalidateLeaderboard(subject_id: string) {
    // Invalidate all time-range variants for this subject
    for (const range of ['daily', 'weekly', 'monthly', 'all']) {
      for (const limit of [10, 25, 50, 100]) {
        await deleteCache(cacheKey(subject_id, range, limit));
      }
    }
  }

  private async _queryLeaderboard(subject_id: string, time_range: string, limit: number) {
    const time_filter = this.getTimeFilter(time_range);
    return this.findMany({
      where: {
        subject_id,
        created_at: time_filter,
      },
      orderBy: [{ score: 'desc' }, { time_taken: 'asc' }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
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
