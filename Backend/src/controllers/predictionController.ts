import { Request, Response } from 'express';
import axios from 'axios';
import { catchAsync } from '../utils/index';

export const predict = catchAsync(async (req: Request, res: Response) => {
  const { data } = req.body;

  if (!data) {
    return res
      .status(400)
      .json({ success: false, message: 'Data is required' });
  }

  const apiEndpoint = 'https://your-prediction-api.com/predict';

  const response = await axios.post(apiEndpoint, { data });

  if (response.status === 200) {
    return res.status(200).json({ success: true, prediction: response.data });
  } else {
    return res
      .status(response.status)
      .json({ success: false, message: response.statusText });
  }
});
