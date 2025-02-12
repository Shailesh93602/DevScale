import { Request, Response, NextFunction } from 'express';
import { createAppError } from '../utils/errorHandler';

export const checkApiVersion = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const version = req.headers['x-api-version'] as string;

  if (!version) {
    return next();
  }

  // Currently supported versions
  const supportedVersions = ['1.0', '1.1'];

  if (!supportedVersions.includes(version)) {
    throw createAppError('API version not supported', 400);
  }

  req.apiVersion = version;
  next();
};
