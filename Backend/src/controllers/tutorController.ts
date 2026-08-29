import { Request, Response } from 'express';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import { TutorService } from '../services/ai/tutorService.js';

export default class TutorController {
  private readonly service: TutorService;

  constructor() {
    this.service = new TutorService();
  }

  /** POST /tutor/ask { question } — grounded answer with citations (or "I don't know"). */
  public ask = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) return sendResponse(res, 'UNAUTHORIZED');
    const question = String(req.body?.question ?? '').trim();
    if (question.length < 3) return sendResponse(res, 'INVALID_PAYLOAD');
    const data = await this.service.answerQuestion(question, req.user.id);
    return sendResponse(res, 'TUTOR_ANSWERED', { data });
  });

  /** POST /tutor/hint { challengeId, level } — progressive hint. */
  public hint = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) return sendResponse(res, 'UNAUTHORIZED');
    const challengeId = String(req.body?.challengeId ?? '').trim();
    if (!challengeId) return sendResponse(res, 'INVALID_PAYLOAD');
    const level = Number(req.body?.level) || 1;
    const data = await this.service.getHint(challengeId, level, req.user.id);
    return sendResponse(res, 'TUTOR_HINT_PROVIDED', { data });
  });
}
