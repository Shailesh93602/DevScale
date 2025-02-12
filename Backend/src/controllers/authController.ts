import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

config();

const prisma = new PrismaClient();

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
    },
    orderBy: { created_at: 'asc' },
  });

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});
