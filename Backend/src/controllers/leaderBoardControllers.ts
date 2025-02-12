import { Request, Response } from 'express';
import { getLeaderboard } from '../services/leaderboardService';
import { leaderboardQuerySchema } from '../validations/leaderboardValidation';
import { createAppError } from '../utils/errorHandler';
import { catchAsync } from '../utils';

export const getLeaderboardEntries = catchAsync(
  async (req: Request, res: Response) => {
    const { error, value } = leaderboardQuerySchema.validate(req.query);
    if (error) throw createAppError(error.message, 400);

    const entries = await getLeaderboard(
      value.subjectId,
      value.timeRange,
      value.limit
    );

    res.status(200).json({
      status: 'success',
      data: entries,
    });
  }
);
