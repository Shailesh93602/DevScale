import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createAppError } from '../utils/errorHandler';
import { BattleStatus } from '@prisma/client';

export const battleAntiCheatMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const battleId = req.params.id || req.body.battle_id;
    const userId = req.user?.id;
    const questionId = req.body.question_id;
    const answer = req.body.answer;
    const timeTaken = req.body.time_taken;

    if (!battleId || !userId || !questionId || !answer || !timeTaken) {
      return next(
        createAppError('Missing required fields for submission', 400)
      );
    }

    // Get battle and question details
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        questions: {
          where: { id: questionId },
        },
        participants: {
          where: { user_id: userId },
        },
      },
    });

    if (!battle) {
      return next(createAppError('Battle not found', 404));
    }

    // Check if battle is in progress
    if (battle.status !== BattleStatus.IN_PROGRESS) {
      return next(createAppError('Battle is not in progress', 403));
    }

    // Check if user is a participant
    if (!battle.participants.length) {
      return next(
        createAppError('You are not a participant in this battle', 403)
      );
    }

    // Check if question exists in battle
    if (!battle.questions.length) {
      return next(createAppError('Invalid question for this battle', 400));
    }

    const question = battle.questions[0];

    // Anti-cheat checks
    // 1. Check if time taken is reasonable
    if (timeTaken < 0 || timeTaken > question.time_limit * 2) {
      return next(createAppError('Invalid time taken for submission', 403));
    }

    // 2. Check for duplicate submissions
    const existingSubmission = await prisma.battleAnswer.findFirst({
      where: {
        question_id: questionId,
        user_id: userId,
      },
    });

    if (existingSubmission) {
      return next(
        createAppError(
          'You have already submitted an answer for this question',
          409
        )
      );
    }

    // 3. Check if answer format is valid
    if (typeof answer !== 'string' || answer.length > 1000) {
      return next(createAppError('Invalid answer format', 400));
    }

    next();
  } catch (error) {
    next(error);
  }
};
