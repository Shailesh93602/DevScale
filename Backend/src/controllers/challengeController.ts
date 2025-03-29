import { Difficulty } from '@prisma/client';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { ChallengeRepository } from '@/repositories/challengeRepository';
export default class ChallengeController {
  private readonly challengeRepo: ChallengeRepository;

  constructor() {
    this.challengeRepo = new ChallengeRepository();
  }

  public getChallenges = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await this.challengeRepo.paginate(
      {
        page: Number(page),
        limit: Number(limit),
        search: String(search),
      },
      ['title', 'description']
    );

    return sendResponse(res, 'CHALLENGES_FETCHED', {
      data: { challenges: result.data },
      meta: result.meta,
    });
  });

  public getChallenge = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const challenge = await this.challengeRepo.findUnique({
      where: { id },
    });

    if (!challenge) {
      return sendResponse(res, 'CHALLENGE_NOT_FOUND');
    }

    return sendResponse(res, 'CHALLENGE_FETCHED', { data: { challenge } });
  });

  public createNewChallenge = catchAsync(
    async (req: Request, res: Response) => {
      const challenge = await this.challengeRepo.create(req.body);
      return sendResponse(res, 'CHALLENGE_CREATED', { data: { challenge } });
    }
  );

  public updateExistingChallenge = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const challenge = await this.challengeRepo.update({
        where: { id },
        data: req.body,
      });
      return sendResponse(res, 'CHALLENGE_UPDATED', { data: { challenge } });
    }
  );

  public getChallengeStatistics = catchAsync(
    async (req: Request, res: Response) => {
      const stats = await this.challengeRepo.getChallengeStats();
      return sendResponse(res, 'CHALLENGE_FETCHED', { data: { stats } });
    }
  );

  public getAllChallengesWithFilters = catchAsync(
    async (req: Request, res: Response) => {
      const { difficulty, category, tags } = req.query;
      const challenges = await this.challengeRepo.getAllChallenges({
        difficulty: difficulty as Difficulty,
        category: category as string,
        tags: tags ? (tags as string).split(',') : undefined,
      });

      return sendResponse(res, 'CHALLENGES_FETCHED', { data: { challenges } });
    }
  );

  public submitChallengeAttempt = catchAsync(
    async (req: Request, res: Response) => {
      const user_id = req.user?.id;
      if (!user_id) {
        return sendResponse(res, 'USER_NOT_FOUND');
      }

      const { challenge_id } = req.params;
      const { code, language, quiz_id, answers, time_spent } = req.body;

      const submission = await this.challengeRepo.submitChallenge({
        code,
        language,
        user_id,
        challenge_id,
        quiz_id,
        answers,
        time_spent,
      });

      return sendResponse(res, 'CHALLENGE_SUBMITTED', { data: { submission } });
    }
  );

  public getChallengeLeaderboard = catchAsync(
    async (req: Request, res: Response) => {
      const { challengeId } = req.query;
      const leaderboard = await this.challengeRepo.getLeaderboard(
        challengeId as string
      );
      return sendResponse(res, 'LEADERBOARD_FETCHED', {
        data: { leaderboard },
      });
    }
  );
}
