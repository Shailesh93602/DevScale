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

      const entries = await this.leaderboardRepo.findMany({
        where: {
          user_id: String(user_id),
          subject_id: String(subject_id),
        },
        orderBy: {
          score: 'desc',
        },
        take: Number(limit),
      });

      sendResponse(res, 'LEADERBOARD_FETCHED', {
        data: entries,
      });
    }
  );
}
