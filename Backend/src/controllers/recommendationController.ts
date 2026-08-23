import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import { RecommendationService } from '../services/ai/recommendationService.js';
import { ChallengeIngestService } from '../services/ai/challengeIngestService.js';

export default class RecommendationController {
  private readonly recommendations: RecommendationService;
  private readonly challengeIngest: ChallengeIngestService;

  constructor() {
    this.recommendations = new RecommendationService();
    this.challengeIngest = new ChallengeIngestService();
  }

  /** GET /recommendations/challenges — personalized "what to try next". */
  public getChallengeRecommendations = catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return sendResponse(res, 'UNAUTHORIZED');
      }
      const limit = Math.min(Number(req.query.limit) || 5, 20);
      const data = await this.recommendations.recommendChallenges(
        userId,
        limit
      );
      return sendResponse(res, 'RECOMMENDATIONS_FETCHED', { data });
    }
  );

  /** POST /recommendations/admin/reindex-challenges — backfill embeddings. */
  public reindexChallenges = catchAsync(
    async (_req: Request, res: Response) => {
      const data = await this.challengeIngest.reindexAll();
      return sendResponse(res, 'CONTENT_REINDEXED', { data });
    }
  );
}
