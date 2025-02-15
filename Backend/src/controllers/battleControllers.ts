import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

export const getBattles = catchAsync(async (req: Request, res: Response) => {
  const battles = await prisma.battle.findMany({
    orderBy: { created_at: 'asc' },
    include: {
      topic: {
        select: { title: true },
      },
    },
  });
  res.status(200).json({ success: true, battles });
});

export const getBattle = catchAsync(async (req: Request, res: Response) => {
  const battleId = req.params.id;
  const battle = await prisma.battle.findUnique({
    where: { id: battleId },
  });
  if (!battle) {
    return res
      .status(404)
      .json({ success: false, message: 'Battle not found' });
  }
  res.status(200).json({ success: true, battle });
});

export const createBattle = catchAsync(async (req: Request, res: Response) => {
  const { title, description, topic_id, difficulty, length, date, time } =
    req.body;

  await prisma.battle.create({
    data: {
      title,
      description,
      user_id: req.user.id,
      topic_id,
      difficulty,
      length,
      date,
      time,
    },
  });

  res
    .status(201)
    .json({ success: true, message: 'Battle created successfully!' });
});
