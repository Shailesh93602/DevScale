import type { LeaderboardEntry } from '@prisma/client';
import BaseRepository from './baseRepository.js';
import prisma from '../lib/prisma.js';
import { getWithSWR, deleteCache } from '../services/cacheService.js';

const LEADERBOARD_TTL = 60; // 60 seconds (fresh)
const LEADERBOARD_STALE_TTL = 3600; // 1 hour (grace period)
const cacheKey = (subjectId: string, timeRange: string, limit: number) =>
  `eduscale:leaderboard:${subjectId}:${timeRange}:${limit}`;

export default class LeaderboardRepository extends BaseRepository< LeaderboardEntry, typeof prisma.leaderboardEntry > {
  constructor() {
    super(prisma.leaderboardEntry);
  }

  async getLeaderboard(subject_id: string, time_range: string, limit: number) {
    const key = cacheKey(subject_id, time_range, limit);
    return getWithSWR(
      key,
      () => this._queryLeaderboard(subject_id, time_range, limit),
      { ttl: LEADERBOARD_TTL, staleTtl: LEADERBOARD_STALE_TTL },
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
    const filters: Record<string, { gte: Date }> = {
      daily: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) },
      weekly: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
      monthly: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
      all: { gte: new Date(0) },
    };
    return filters[timeRange];
  }
}
