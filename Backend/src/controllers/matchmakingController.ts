import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import { MatchmakingService } from '../services/matchmaking/matchmakingService.js';

export default class MatchmakingController {
  private readonly service: MatchmakingService;

  constructor() {
    this.service = new MatchmakingService();
  }

  /** POST /matchmaking/join — enqueue + attempt an immediate match. */
  public join = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');
    const result = await this.service.joinQueue(userId);
    return sendResponse(res, 'MATCHMAKING_JOINED', { data: result });
  });

  /** POST /matchmaking/leave — remove from the queue. */
  public leave = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');
    await this.service.leaveQueue(userId);
    return sendResponse(res, 'MATCHMAKING_LEFT', { data: { left: true } });
  });

  /** GET /matchmaking/status — am I queued + how big is the queue. */
  public status = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');
    const data = await this.service.getStatus(userId);
    return sendResponse(res, 'MATCHMAKING_STATUS_FETCHED', { data });
  });
}
