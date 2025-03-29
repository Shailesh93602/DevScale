import { Request, Response } from 'express';
import { catchAsync, parse } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import UserRepository from '../repositories/userRepository';
import { createAppError } from '@/utils/errorHandler';
import UserRoadmapRepository from '@/repositories/userRoadmapRepository';

export default class UserController {
  private readonly userRepo: UserRepository;
  private readonly userRoadmapRepo: UserRoadmapRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.userRoadmapRepo = new UserRoadmapRepository();
  }

  public getProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userRepo.findUnique({
      where: { supabase_id: req.user?.id },
    });

    if (!user) {
      return sendResponse(res, 'USER_NOT_CREATED');
    }

    sendResponse(res, 'PROFILE_FETCHED', {
      data: { user: parse(user) },
    });
  });

  public getUserProgress = catchAsync(async (req: Request, res: Response) => {
    // TODO: Implement logic to fetch user progress

    sendResponse(res, 'PROGRESS_FETCHED', {
      data: { progress: 0 },
    });
  });

  public getUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const userRoadmap = await this.userRepo.findUnique({
      where: {
        id: user_id,
      },
      include: {
        user_roadmaps: {
          include: {
            roadmap: true,
          },
        },
      },
    });

    if (!userRoadmap) {
      throw createAppError('You are not enrolled in any roadmap', 404);
    }

    sendResponse(res, 'ROADMAP_FETCHED', {
      data: { userRoadmap },
    });
  });

  public insertUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const userRoadmap = await this.userRoadmapRepo.create({
      data: {
        user_id: req.user.id,
        roadmap_id: req.body.roadmap_id,
      },
    });

    sendResponse(res, 'ROADMAP_ENROLLED', { data: userRoadmap });
  });

  public deleteUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const { id } = req.params;

    await this.userRoadmapRepo.delete({ where: { id, user_id } });

    sendResponse(res, 'ROADMAP_REMOVED');
  });

  public upsertUser = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userRepo.upsertUserProfile({
      supabase_id: req.user.id,
      ...req.body,
    });
    sendResponse(res, 'USER_UPDATED', { data: { user } });
  });

  public checkUsername = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.query;

    if (!username || typeof username !== 'string') {
      throw createAppError('Invalid username', 400);
    }

    const isAvailable = await this.userRepo.findFirst({ where: { username } });

    console.log(
      '🚀 --------------------------------------------------------------------------🚀'
    );

    sendResponse(res, 'USERNAME_AVAILABILITY_CHECKED', {
      data: { isAvailable: !isAvailable },
    });
  });
}
