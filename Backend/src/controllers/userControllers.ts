import { Request, Response } from 'express';
import prisma from '../prisma';
import { catchAsync, parse } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import * as userService from '../services/userService';

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { supabase_id: req.user.id },
  });

  if (!user) {
    return sendResponse(res, 'USER_NOT_CREATED');
  }

  sendResponse(res, 'PROFILE_FETCHED', {
    data: { user: parse(user) },
  });
});

export const getUserProgress = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user.id;

    // TODO: implement this method
    const roadmaps = await prisma.roadmap.findMany({
      include: {
        main_concepts: {
          select: {
            main_concept: {
              include: {
                subjects: {
                  select: {
                    subject: {
                      include: {
                        topics: {
                          select: {
                            topic: {
                              include: {
                                progress: {
                                  where: { user_id },
                                  select: { id: true, status: true },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    sendResponse(res, 'PROGRESS_FETCHED', {
      data: { roadmaps },
    });
  }
);

export const getUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const userRoadmap = await prisma.userRoadmap.findFirst({
      where: { user_id },
    });

    if (!userRoadmap) {
      return res
        .status(200)
        .json({ success: true, message: 'No roadmap found for the user' });
    }

    res.status(200).json({ success: true, userRoadmap });
  }
);

export const insertUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const isRoadmapExists = await prisma.userRoadmap.findFirst({
      where: { user_id },
    });

    if (isRoadmapExists) {
      return res.status(400).json({
        success: false,
        message:
          'You already added a Roadmap, please remove existing Roadmap to add another Roadmap',
      });
    }

    const { roadmap_id, topic_id } = req.body;
    const userRoadmap = await prisma.userRoadmap.create({
      data: {
        user_id,
        roadmap_id,
        topic_id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User roadmap inserted successfully',
      userRoadmap,
    });
  }
);

export const deleteUserRoadmap = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await prisma.userRoadmap.delete({
      where: { id },
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: 'User roadmap not found' });
    }

    res
      .status(200)
      .json({ success: true, message: 'User roadmap deleted successfully' });
  }
);

export const upsertUser = catchAsync(async (req: Request, res: Response) => {
  const { id: supabase_id, email } = req.user;
  const updateData = req.body;

  const user = await userService.upsertUserProfile({
    supabase_id,
    email,
    ...updateData,
    graduation_year: updateData.graduation_year
      ? parseInt(updateData.graduation_year)
      : undefined,
    skills: Array.isArray(updateData.skills)
      ? updateData.skills
      : [updateData.skills],
  });

  return sendResponse(res, user ? 'USER_UPDATED' : 'USER_CREATED', {
    data: { user: parse(user) },
  });
});

export const checkUsername = catchAsync(async (req: Request, res: Response) => {
  const { username } = req.params;
  const isAvailable = await prisma.user.findFirst({
    where: { username },
  });

  sendResponse(res, 'USERNAME_CHECKED', {
    data: { available: !isAvailable },
  });
});
