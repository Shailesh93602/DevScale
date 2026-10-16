import { Difficulty } from '../constants/enums';
import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import { ChallengeRepository } from '../repositories/challengeRepository';
import { recordActionBestEffort } from '../services/auditTrail';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
// The validated body is camelCase; the Challenge columns are snake_case and
// test cases live in their own table. `language` has no column.
type ChallengeBody = {
  title?: string;
  description?: string;
  points?: number;
  difficulty?: string;
  category?: string;
  inputFormat?: string;
  outputFormat?: string;
  exampleInput?: string;
  exampleOutput?: string;
  constraints?: string;
  functionSignature?: string;
  timeLimit?: number;
  memoryLimit?: number;
  tags?: string[];
  testCases?: Array<{ input: string; output: string }>;
};

const toChallengeData = (body: ChallengeBody, replaceTestCases: boolean) => {
  const data: Record<string, unknown> = {
    title: body.title,
    description: body.description,
    points: body.points,
    difficulty: body.difficulty,
    category: body.category,
    input_format: body.inputFormat,
    output_format: body.outputFormat,
    example_input: body.exampleInput,
    example_output: body.exampleOutput,
    constraints: body.constraints,
    function_signature: body.functionSignature,
    time_limit: body.timeLimit,
    memory_limit: body.memoryLimit,
    tags: body.tags,
  };
  if (body.testCases) {
    const create = body.testCases.map(({ input, output }) => ({
      input,
      output,
    }));
    data.test_cases = replaceTestCases
      ? { deleteMany: {}, create }
      : { create };
  }
  return Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
};

export default class ChallengeController {
  private readonly challengeRepo: ChallengeRepository;

  constructor() {
    this.challengeRepo = new ChallengeRepository();
  }

  public getChallengeCategories = catchAsync(
    async (_req: Request, res: Response) => {
      const rows = await prisma.challenge.groupBy({
        by: ['category', 'difficulty'],
        _count: { _all: true },
        orderBy: { category: 'asc' },
      });

      // Group into { category, count, difficulties[] }
      const map = new Map<
        string,
        { category: string; count: number; difficulties: string[] }
      >();
      for (const row of rows) {
        const cat = row.category as string;
        if (!map.has(cat))
          map.set(cat, { category: cat, count: 0, difficulties: [] });
        const entry = map.get(cat)!;
        entry.count += row._count._all;
        if (!entry.difficulties.includes(row.difficulty)) {
          entry.difficulties.push(row.difficulty);
        }
      }

      return sendResponse(res, 'CHALLENGES_FETCHED', {
        data: Array.from(map.values()),
      });
    }
  );

  public getChallenges = catchAsync(async (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = '' } = req.query;
    // Clamped: an uncapped limit dumps the table, a negative page gives a
    // negative skip (Prisma 500).
    const result = await this.challengeRepo.paginate(
      {
        page: Math.max(1, Math.floor(Number(page)) || 1),
        limit: Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10)),
        search: String(search),
      },
      ['title', 'description'],
      { omit: { solutions: true, editorial: true } }
    );

    return sendResponse(res, 'CHALLENGES_FETCHED', {
      data: result.data,
      meta: result.meta,
    });
  });

  public getChallenge = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    // Reference solutions are never public. (The editorial stays: the
    // problem page renders it; gating it on an accepted submission is a
    // product call.)
    const challenge = await this.challengeRepo.findUnique({
      where: { id },
      omit: { solutions: true },
    });

    if (!challenge) {
      return sendResponse(res, 'CHALLENGE_NOT_FOUND');
    }

    return sendResponse(res, 'CHALLENGE_FETCHED', { data: challenge });
  });

  public createNewChallenge = catchAsync(
    async (req: Request, res: Response) => {
      const challenge = await this.challengeRepo.create({
        data: toChallengeData(req.body as ChallengeBody, false),
      });

      // A challenge body includes its TEST CASES — the expected outputs every
      // other user is graded against. Creating or editing one silently changes
      // whether other people's submissions pass, which is why this is
      // ADMIN/MODERATOR-gated and why it needs a record of who did it.
      await recordActionBestEffort(
        {
          admin_id: req.user?.id ?? 'unknown',
          action: 'CREATE_CHALLENGE',
          entity: 'CHALLENGE',
          entity_id: (challenge as { id?: string })?.id ?? 'unknown',
          details: { title: (req.body as { title?: string })?.title },
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        },
        logger
      );

      return sendResponse(res, 'CHALLENGE_CREATED', { data: challenge });
    }
  );

  public updateExistingChallenge = catchAsync(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const challenge = await this.challengeRepo.update({
        where: { id },
        data: toChallengeData(req.body as ChallengeBody, true),
      });

      // Field NAMES, not values: a challenge body carries test cases and
      // expected outputs, and copying those into a long-lived audit table
      // makes the answers readable to anyone with audit access.
      await recordActionBestEffort(
        {
          admin_id: req.user?.id ?? 'unknown',
          action: 'UPDATE_CHALLENGE',
          entity: 'CHALLENGE',
          entity_id: id,
          details: {
            fieldsChanged: Object.keys((req.body ?? {}) as object).sort(),
          },
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
        },
        logger
      );

      return sendResponse(res, 'CHALLENGE_UPDATED', { data: challenge });
    }
  );

  public getChallengeStatistics = catchAsync(
    async (req: Request, res: Response) => {
      const stats = await this.challengeRepo.getChallengeStats();
      return sendResponse(res, 'CHALLENGE_FETCHED', { data: stats });
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

      return sendResponse(res, 'CHALLENGES_FETCHED', { data: challenges });
    }
  );

  public submitChallengeAttempt = catchAsync(
    async (req: Request, res: Response) => {
      const user_id = req.user?.id;
      if (!user_id) {
        return sendResponse(res, 'USER_NOT_FOUND');
      }

      // Route param is ':challengeId' — reading 'challenge_id' gave undefined
      // → findUnique({ id: undefined }) → 500.
      const { challengeId } = req.params;
      const { code, language, quiz_id, answers, time_spent } = req.body;

      const submission = await this.challengeRepo.submitChallenge({
        code,
        language,
        user_id,
        challenge_id: challengeId,
        quiz_id,
        answers,
        time_spent,
      });

      return sendResponse(res, 'CHALLENGE_SUBMITTED', { data: submission });
    }
  );

  public getChallengeLeaderboard = catchAsync(
    async (req: Request, res: Response) => {
      const { challengeId } = req.query;
      const leaderboard = await this.challengeRepo.getLeaderboard(
        challengeId as string
      );
      return sendResponse(res, 'LEADERBOARD_FETCHED', {
        data: leaderboard,
      });
    }
  );
}
