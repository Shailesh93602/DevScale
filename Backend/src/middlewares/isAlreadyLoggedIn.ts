import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config';
import prisma from '../prisma';

export const isAlreadyLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return next();
    }

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const { email } = decodedToken;

    if (!email) {
      return next();
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return next();
    }

    req.user = user;
  } catch (error) {
    console.log(error);
    next();
  }
};
