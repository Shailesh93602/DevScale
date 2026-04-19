import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createAppError } from '../utils/errorHandler';

const MIN_ANSWER_TIME_MS = 500; // cap implausibly fast answers

export const battleAntiCheatMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { battle_id, question_id, selected_option, time_taken_ms } = req.body;
    const userId = req.user?.id;

    if (
      !battle_id ||
      !userId ||
      !question_id ||
      selected_option === undefined ||
      time_taken_ms === undefined
    ) {
      return next(
        createAppError('Missing required fields for submission', 400)
      );
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battle_id },
      include: {
        questions: { where: { id: question_id } },
        participants: { where: { user_id: userId } },
      },
    });

    if (!battle) return next(createAppError('Battle not found', 404));
    if (battle.status !== 'IN_PROGRESS') {
      return next(createAppError('Battle is not in progress', 403));
    }
    if (!battle.participants.length) {
      return next(
        createAppError('You are not a participant in this battle', 403)
      );
    }
    if (!battle.questions.length) {
      return next(createAppError('Invalid question for this battle', 400));
    }

    const question = battle.questions[0];
    const maxAllowedMs = question.time_limit * 1000 + 5000; // 5s grace period

    if (time_taken_ms < 0 || time_taken_ms > maxAllowedMs) {
      return next(createAppError('Invalid time taken for submission', 403));
    }

    // Cap minimum time to prevent speed-bonus gaming
    req.body.time_taken_ms = Math.max(time_taken_ms, MIN_ANSWER_TIME_MS);

    const existingAnswer = await prisma.battleAnswer.findFirst({
      where: { question_id, user_id: userId },
    });
    if (existingAnswer) {
      return next(
        createAppError('Answer already submitted for this question', 409)
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
