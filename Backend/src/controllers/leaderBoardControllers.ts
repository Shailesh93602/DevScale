import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import LeaderboardRepository from '../repositories/leaderboardRepository';
import { sendResponse } from '../utils/apiResponse';

export default class LeaderboardController {
  private readonly leaderboardRepo: LeaderboardRepository;

  constructor() {
    this.leaderboardRepo = new LeaderboardRepository();
  }

  public getLeaderboardEntries = catchAsync(
    async (req: Request, res: Response) => {
      const { user_id, subject_id, limit } = req.query;
      // Capped. This route does not use paginationMiddleware, so it had no
      // ceiling of its own: `?limit=99999999` asked for every leaderboard row
      // in the table.
      const parsedLimit = Number(limit);
      const take =
        Number.isFinite(parsedLimit) && parsedLimit > 0
          ? Math.min(parsedLimit, 100)
          : 50;
      const where: Record<string, string> = {};

      if (typeof user_id === 'string' && user_id && user_id !== 'undefined') {
        where.user_id = user_id;
      }

      if (
        typeof subject_id === 'string' &&
        subject_id &&
        subject_id !== 'undefined'
      ) {
        where.subject_id = subject_id;
      }

      const entries = await this.leaderboardRepo.findMany({
        where,
        orderBy: {
          score: 'desc',
        },
        take,
      });

      sendResponse(res, 'LEADERBOARD_FETCHED', {
        data: entries,
      });
    }
  );
}
