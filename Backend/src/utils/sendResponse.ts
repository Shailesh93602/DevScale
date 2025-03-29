import { Response } from 'express';
import { ResponseType } from '../types/response';

interface ApiResponse<T> {
  success: boolean;
  type: ResponseType;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  type: ResponseType,
  data?: T,
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    type,
    ...(data && { data }),
  };
  
  res.status(statusCode).json(response);
};
