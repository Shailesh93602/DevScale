import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config';
import prisma from '../prisma';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const { email } = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      res.status(403).json({ success: false, message: 'User not found' });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token' });
  }
};
