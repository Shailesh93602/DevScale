/**
 * GET /api/v1/stats/summary
 * Public landing-page stats — no auth required.
 * Returns aggregate platform counts cached in Redis for 5 minutes.
 * Single $queryRaw so it's one DB round-trip on cache miss.
 */
import { Request, Response } from 'express';
import { BaseRouter } from './BaseRouter';
import prisma from '../lib/prisma';
import { getCache, setCache } from '../services/cacheService';
import logger from '../utils/logger';

const CACHE_KEY = 'eduscale:stats:summary';
const CACHE_TTL = 5 * 60; // 5 minutes

export class StatsRoutes extends BaseRouter {
  protected initializeRoutes(): void {
    this.router.get('/summary', async (req: Request, res: Response) => {
      try {
        const cached = await getCache<Record<string, number>>(CACHE_KEY);
        if (cached) {
          res.json({ success: true, data: cached });
          return;
        }

        const [row] = await prisma.$queryRaw<
          [
            {
              total_users: bigint;
              total_battles: bigint;
              total_roadmaps: bigint;
              total_topics: bigint;
            },
          ]
        >`
          SELECT
            (SELECT COUNT(*) FROM "User")    AS total_users,
            (SELECT COUNT(*) FROM "Battle")  AS total_battles,
            (SELECT COUNT(*) FROM "Roadmap") AS total_roadmaps,
            (SELECT COUNT(*) FROM "Topic")   AS total_topics
        `;

        const data = {
          totalUsers: Number(row.total_users),
          totalBattles: Number(row.total_battles),
          totalRoadmaps: Number(row.total_roadmaps),
          totalTopics: Number(row.total_topics),
        };

        await setCache(CACHE_KEY, data, { ttl: CACHE_TTL });
        res.json({ success: true, data });
      } catch (err) {
        logger.error('Failed to fetch stats summary', { err });
        res
          .status(500)
          .json({ success: false, message: 'Failed to fetch stats' });
      }
    });
  }
}

export default new StatsRoutes().getRouter();
