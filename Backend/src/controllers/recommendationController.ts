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

  /**
   * POST /recommendations/admin/reindex-challenges — backfill embeddings.
   *
   * `?force=true` (or `{ "force": true }` in the body) re-embeds every row
   * regardless of its stored fingerprint. Not needed after a model change —
   * the fingerprint handles that — only when the provider's output changed
   * under the same model name, or the table is not trusted.
   */
  public reindexChallenges = catchAsync(async (req: Request, res: Response) => {
    const force = parseForce(req);
    const data = await this.challengeIngest.reindexAll({ force });
    return sendResponse(res, 'CONTENT_REINDEXED', { data });
  });
}

/** Only the literal `true` (query string) or boolean `true` (body) forces. */
export function parseForce(req: Request): boolean {
  const query = req.query?.force;
  if (query === 'true') return true;
  const body = (req.body as { force?: unknown } | undefined)?.force;
  return body === true;
}
