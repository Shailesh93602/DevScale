import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createAppError } from '../utils/errorHandler';
import { BattleStatus } from '@prisma/client';

export const battleParticipantMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const battleId = req.params.id || req.body.battle_id;
    const userId = req.user?.id;

    if (!battleId || !userId) {
      return next(createAppError('Battle ID and user ID are required', 400));
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.battleParticipant.findUnique({
      where: {
        battle_id_user_id: {
          battle_id: battleId,
          user_id: userId,
        },
      },
    });

    if (existingParticipant) {
      return next(
        createAppError('You are already a participant in this battle', 409)
      );
    }

    // Check battle capacity
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
      },
    });

    if (!battle) {
      return next(createAppError('Battle not found', 404));
    }

    if (battle.current_participants >= battle.max_participants) {
      return next(createAppError('Battle is full', 403));
    }

    if (battle.status !== BattleStatus.UPCOMING) {
      return next(createAppError('Cannot join this battle at this time', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
