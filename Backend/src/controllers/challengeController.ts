import { Difficulty, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import {
  createChallenge,
  updateChallenge,
  getAllChallenges,
  submitChallenge,
  getLeaderboard,
} from '../services/challengeService';
import { getChallengeStats } from '../services/adminResourceService';
import { paginate } from '../utils/pagination';

const prisma = new PrismaClient();

export const getChallenges = catchAsync(async (req: Request, res: Response) => {
  const result = await paginate({
    req,
    model: prisma.challenge,
    searchFields: ['title', 'description'],
  });

  return sendResponse(res, 'CHALLENGES_FETCHED', {
    data: { challenges: result.data },
    meta: result.meta,
  });
});

export const getChallenge = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    return sendResponse(res, 'CHALLENGE_NOT_FOUND');
  }

  return sendResponse(res, 'CHALLENGE_FETCHED', { data: { challenge } });
});

export const createNewChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const challenge = await createChallenge(req.body);
    return sendResponse(res, 'CHALLENGE_CREATED', { data: { challenge } });
  }
);

export const updateExistingChallenge = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await updateChallenge(id, req.body);
    return sendResponse(res, 'CHALLENGE_UPDATED', { data: { challenge } });
  }
);

export const getChallengeStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await getChallengeStats();
    return sendResponse(res, 'CHALLENGE_FETCHED', { data: { stats } });
  }
);

export const getAllChallengesWithFilters = catchAsync(
  async (req: Request, res: Response) => {
    const { difficulty, category, tags } = req.query;
    const challenges = await getAllChallenges({
      difficulty: difficulty as Difficulty,
      category: category as string,
      tags: tags ? (tags as string).split(',') : undefined,
    });

    return sendResponse(res, 'CHALLENGES_FETCHED', { data: { challenges } });
  }
);

export const submitChallengeAttempt = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.user?.id;
    if (!user_id) {
      return sendResponse(res, 'USER_NOT_FOUND');
    }

    const { challenge_id } = req.params;
    const { code, language } = req.body;

    const submission = await submitChallenge({
      code,
      language,
      user_id,
      challenge_id,
    });

    return sendResponse(res, 'CHALLENGE_SUBMITTED', { data: { submission } });
  }
);

export const getChallengeLeaderboard = catchAsync(
  async (req: Request, res: Response) => {
    const { challengeId } = req.query;
    const leaderboard = await getLeaderboard(challengeId as string);
    return sendResponse(res, 'LEADERBOARD_FETCHED', { data: { leaderboard } });
  }
);
