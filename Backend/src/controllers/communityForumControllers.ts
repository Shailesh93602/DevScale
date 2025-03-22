import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';

const prisma = new PrismaClient();

export const getForums = catchAsync(async (req: Request, res: Response) => {
  const forums = await prisma.forum.findMany({
    orderBy: { created_at: 'asc' },
  });
  return sendResponse(res, 'FORUMS_FETCHED', { data: forums });
});

export const getForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;
  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
  });

  if (!forum) {
    return sendResponse(res, 'FORUM_NOT_FOUND');
  }

  return sendResponse(res, 'FORUM_FETCHED', { data: forum });
});

export const createForum = catchAsync(async (req: Request, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return sendResponse(res, 'INVALID_PAYLOAD');
  }

  const forum = await prisma.forum.create({
    data: {
      title,
      description,
      created_by: req.user.id,
    },
  });

  return sendResponse(res, 'FORUM_CREATED', { data: forum });
});

export const updateForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;
  const { title, description } = req.body;

  if (!title || !description) {
    return sendResponse(res, 'INVALID_PAYLOAD');
  }

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
  });

  if (!forum) {
    return sendResponse(res, 'FORUM_NOT_FOUND');
  }

  const updatedForum = await prisma.forum.update({
    where: { id: forumId },
    data: { title, description },
  });

  return sendResponse(res, 'FORUM_UPDATED', { data: updatedForum });
});

export const deleteForum = catchAsync(async (req: Request, res: Response) => {
  const forumId = req.params.id;

  const forum = await prisma.forum.findUnique({
    where: { id: forumId },
  });

  if (!forum) {
    return sendResponse(res, 'FORUM_NOT_FOUND');
  }

  await prisma.forum.delete({
    where: { id: forumId },
  });

  return sendResponse(res, 'FORUM_DELETED');
});
