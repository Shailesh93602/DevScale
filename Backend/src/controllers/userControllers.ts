import { Request, Response } from 'express';
import { catchAsync, parse } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import UserRepository from '../repositories/userRepository';
import { createAppError } from '../utils/errorHandler';
import UserRoadmapRepository from '../repositories/userRoadmapRepository';
import UserProgressRepository from '../repositories/userProgressRepository';
import { clearAuthCache } from '../middlewares/authMiddleware';
import { getCached, setCached, invalidatePattern } from '../services/memoryCache';

export default class UserController {
  private readonly userRepo: UserRepository;
  private readonly userRoadmapRepo: UserRoadmapRepository;
  private readonly userProgressRepo: UserProgressRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.userRoadmapRepo = new UserRoadmapRepository();
    this.userProgressRepo = new UserProgressRepository();
  }

  public getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id ?? '';
    const cacheKey = `user:profile:${userId}`;

    // 1. Check cache first
    const cachedProfile = getCached<any>(cacheKey);
    if (cachedProfile) {
      return sendResponse(res, 'PROFILE_FETCHED', {
        data: cachedProfile,
      });
    }

    // 2. Cache miss — fetch from DB
    const user = await this.userRepo.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: { id: true, name: true, description: true },
        },
        user_points: true,
      },
    });

    if (!user) {
      return sendResponse(res, 'USER_NOT_CREATED');
    }

    const parsedUser = parse(user);

    // 3. Set cache (60s TTL)
    setCached(cacheKey, parsedUser, 60);

    sendResponse(res, 'PROFILE_FETCHED', {
      data: parsedUser,
    });
  });

  public getUserProgress = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id ?? '';
    const progress = await this.userProgressRepo.getUserProgress(userId);

    sendResponse(res, 'PROGRESS_FETCHED', {
      data: progress,
    });
  });

  public getUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
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
      data: userRoadmap,
    });
  });

  public insertUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const userRoadmap = await this.userRoadmapRepo.create({
      data: {
        user_id: req.user?.id ?? '',
        roadmap_id: req.body.roadmap_id,
      },
    });

    sendResponse(res, 'ROADMAP_ENROLLED', { data: userRoadmap });
  });

  public deleteUserRoadmap = catchAsync(async (req: Request, res: Response) => {
    const user_id = req.user?.id ?? '';
    const { id } = req.params;

    await this.userRoadmapRepo.delete({ where: { id, user_id } });

    sendResponse(res, 'ROADMAP_REMOVED');
  });

  public upsertUser = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id ?? '';
    const { username } = req.body;

    if (username) {
      const existingUser = await this.userRepo.findFirst({
        where: {
          username: { equals: username, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw createAppError('Username already taken', 400);
      }
    }

    // Sanitize output for Prisma enums and other fields
    const sanitizedData = { ...req.body };
    if (sanitizedData.experience_level === '') {
      sanitizedData.experience_level = null;
    }
    // Also ensures specialization, bio etc. are null if empty (optional)
    const optionalFields = ['specialization', 'bio', 'college', 'address', 'note', 'github_url', 'linkedin_url', 'twitter_url', 'website_url'];
    optionalFields.forEach(field => {
      if (sanitizedData[field] === '') {
        sanitizedData[field] = null;
      }
    });

    const user = await this.userRepo.upsertUserProfile({
      id: userId,
      supabase_id: req.user?.supabase_id,
      email: req.user?.email,
      ...sanitizedData,
    });

    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      clearAuthCache(token);
    }

    // Also invalidate the profile cache since data changed
    invalidatePattern(`user:profile:${userId}`);

    sendResponse(res, 'USER_UPDATED', { data: user });
  });

  public checkUsername = catchAsync(async (req: Request, res: Response) => {
    const { username } = req.query;
    const currentUserId = req.user?.id;

    if (!username || typeof username !== 'string') {
      throw createAppError('Invalid username', 400);
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      throw createAppError('Username is not available', 400);
    }

    const user = await this.userRepo.findFirst({
      where: {
        username: { equals: username, mode: 'insensitive' },
      },
    });

    // Available if no user found OR it's the current user
    const isAvailable = !user || user.id === currentUserId;

    sendResponse(res, 'USERNAME_AVAILABILITY_CHECKED', {
      data: isAvailable,
    });
  });
}
