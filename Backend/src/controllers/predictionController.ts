import { Request, Response } from 'express';
import { catchAsync } from '../utils/index';
import { createAppError } from '../utils/errorHandler';

/**
 * The ML "prediction" feature was never implemented — the previous version
 * proxied to a placeholder URL (https://your-prediction-api.com) and the
 * `ml` / `ml-logistic-regression` dependencies were never used. Rather than
 * ship a fake endpoint, this returns 501 until a real model is built.
 *
 * Follow-up (tracked in MANUAL.md): remove this controller and its route
 * entirely, or implement a real recommendation model over existing progress data.
 */
export default class PredictionController {
  public predict = catchAsync(async (_req: Request, _res: Response) => {
    throw createAppError('Prediction is not available yet.', 501);
  });
}
