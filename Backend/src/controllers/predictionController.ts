import { Request, Response } from 'express';
import axios from 'axios';
import { catchAsync } from '../utils/index';
import { createAppError } from '@/utils/errorHandler';
import { sendResponse } from '@/utils/apiResponse';

export default class PredictionController {
  public predict = catchAsync(async (req: Request, res: Response) => {
    const { data } = req.body;

    if (!data) {
      throw createAppError('Data is required', 400);
    }

    const apiEndpoint = 'https://your-prediction-api.com/predict';

    const response = await axios.post(apiEndpoint, { data });

    if (response.status === 200) {
      return sendResponse(res, 'PREDICTED', { data: response.data });
    } else {
      throw createAppError(response.statusText, response.status);
    }
  });
}
