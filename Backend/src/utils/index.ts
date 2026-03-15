import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Promise<any>;

export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parse = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};
