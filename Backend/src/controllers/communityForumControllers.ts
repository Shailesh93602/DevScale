import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';

const prisma = new PrismaClient();

export const getForums = catchAsync(async (req: Request, res: Response) => {
  const forums = await prisma.forum.findMany({
    orderBy: { created_at: 'asc' },
  });
  res.status(200).json({ success: true, forums });
});

export const getForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
  });
  if (!forum) {
    return res.status(404).json({ success: false, message: 'Forum not found' });
  }
  res.status(200).json({ success: true, forum });
});

export const createForum = catchAsync(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  await prisma.forum.create({
    data: {
      title,
      description,
      created_by: req.user.id,
    },
  });
  res
    .status(201)
    .json({ success: true, message: 'Forum created successfully!' });
});

export const updateForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  const updatedForum = await prisma.forum.update({
    where: { id: forumId },
    data: { title, description },
  });
  if (!updatedForum) {
    return res.status(404).json({ success: false, message: 'Forum not found' });
  }
  res
    .status(200)
    .json({ success: true, message: 'Forum updated successfully!' });
});

export const deleteForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;
  const deletedForum = await prisma.forum.delete({
    where: { id: forumId },
  });
  if (!deletedForum) {
    return res.status(404).json({ success: false, message: 'Forum not found' });
  }
  res
    .status(200)
    .json({ success: true, message: 'Forum deleted successfully!' });
});
