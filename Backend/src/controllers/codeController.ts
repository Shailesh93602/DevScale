import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { sendResponse } from '../utils/apiResponse';
import logger from '../utils/logger';
import { executeCode } from '../utils/codeExecutor';
import { wrapCode } from '../utils/codeWrapper';
import { ChallengeRepository } from '../repositories/challengeRepository';
import prisma from '../lib/prisma';

export default class CodeController {
  private readonly challengeRepo: ChallengeRepository;

  constructor() {
    this.challengeRepo = new ChallengeRepository();
  }

  public saveDraft = catchAsync(async (req: Request, res: Response) => {
    const { challengeId, code, language } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 'UNAUTHORIZED', { data: { message: 'Login required to save progress' } });
    }

    const draft = await prisma.challengeDraft.upsert({
      where: {
        user_challenge_language: {
          user_id: userId,
          challenge_id: challengeId,
          language: language,
        }
      },
      update: { code },
      create: {
        user_id: userId,
        challenge_id: challengeId,
        language: language,
        code: code,
      }
    });

    return sendResponse(res, 'DRAFT_SAVED', { data: draft });
  });

  public getDraft = catchAsync(async (req: Request, res: Response) => {
    const { challengeId } = req.params;
    const { language } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 'DRAFT_FETCHED', { data: null });
    }

    const draft = await prisma.challengeDraft.findUnique({
      where: {
        user_challenge_language: {
          user_id: userId,
          challenge_id: challengeId,
          language: language as string,
        }
      }
    });

    return sendResponse(res, 'DRAFT_FETCHED', { data: draft });
  });

  public runCode = catchAsync(async (req: Request, res: Response) => {
    // Be robust with field names from frontend
    const code = req.body.code;
    const language = req.body.language;
    const challengeId = req.body.challengeId || req.body.challenge_id || req.body.id;
    const challengeTitle = req.body.challengeTitle;
    let { input = '' } = req.body;

    logger.debug('Resolved code execution target', { challengeId, challengeTitle });

    let challenge: any = null;

    if (challengeId) {
      try {
        // Try finding by ID first, then by title if it's a string
        challenge = await this.challengeRepo.findFirst({
          where: {
            OR: [
              { id: challengeId },
              { title: challengeId },
              { title: challengeTitle || '' }
            ]
          },
          include: { test_cases: true }
        });

        if (challenge) {
          logger.debug('Found challenge for wrapping', { title: challenge.title });
          // Set default input if none provided
          if (!input && challenge.test_cases?.length > 0) {
            input = challenge.test_cases[0].input;
          }
        } else {
          logger.debug('No challenge found for wrapping, skipping wrapper');
        }
      } catch (err) {
        logger.error('Error during challenge lookup for code wrapping', { err });
      }
    }

    const result = await (async () => {
      const results: any[] = [];
      const testCasesToRun = [];

      if (challenge && challenge.test_cases?.length > 0) {
        // Run all public test cases
        const publicCases = challenge.test_cases.filter((tc: any) => !tc.is_hidden);
        testCasesToRun.push(...publicCases);
      } else {
        // Basic execution with provided input or default
        testCasesToRun.push({ input: input || '', output: '' });
      }

      const executionPromises = testCasesToRun.map(async (tc) => {
        const wrapped = challenge ? wrapCode(code, language, challenge, tc.input) : code;
        try {
          const execResult = await executeCode({
            code: wrapped,
            language,
            input: tc.input,
          });

          const actualOutput = execResult.output.trim();
          const expectedOutput = (tc.output || '').trim();
          
          // Basic comparison - might need something more robust for floating points or whitespace
          let status = 'Accepted';
          if (tc.output) {
             status = actualOutput === expectedOutput ? 'Accepted' : 'Wrong Answer';
          }

          return {
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput,
            status,
            executionTime: execResult.executionTime,
            memoryUsed: execResult.memoryUsed,
          };
        } catch (err: any) {
          return {
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput: err.message || 'Execution Error',
            status: 'Error',
            executionTime: 0,
            memoryUsed: 0,
          };
        }
      });

      return await Promise.all(executionPromises);
    })();

    return sendResponse(res, 'CODE_EXECUTED', { data: result });
  });
}
