import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import prisma from '../lib/prisma.js';
import { DEFAULT_RATING } from '../services/rating/ratingMath.js';

const creatorSelect = {
  id: true,
  username: true,
  first_name: true,
  last_name: true,
} as const;

export default class RatingController {
  /** GET /ratings/me — the caller's competitive rating (defaults if unrated). */
  public getMyRating = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 'UNAUTHORIZED');
    }
    const rating = await prisma.userRating.findUnique({
      where: { user_id: userId },
    });
    const data = rating ?? {
      user_id: userId,
      rating: DEFAULT_RATING,
      peak_rating: DEFAULT_RATING,
      games_played: 0,
      wins: 0,
      losses: 0,
      unrated: true,
    };
    return sendResponse(res, 'RATING_FETCHED', { data });
  });

  /** GET /ratings/leaderboard — top players by rating. */
  public getRatingLeaderboard = catchAsync(
    async (req: Request, res: Response) => {
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const data = await prisma.userRating.findMany({
        orderBy: { rating: 'desc' },
        take: limit,
        include: { user: { select: creatorSelect } },
      });
      return sendResponse(res, 'RATING_LEADERBOARD_FETCHED', { data });
    }
  );
}
