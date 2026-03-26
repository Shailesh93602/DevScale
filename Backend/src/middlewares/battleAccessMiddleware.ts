import { Request, Response, NextFunction } from 'express';
import prisma from '@/lib/prisma';
import { createAppError } from '@/utils/errorHandler';
import { BattleStatus } from '@prisma/client';

// Extend Express Request type to include battle and battleAccess
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      battle?: any;
      battleAccess?: {
        isCreator: boolean;
        isParticipant: boolean;
      };
    }
  }
}

export const battleAccessMiddleware = async (
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

    // Check if battle exists
    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: {
        participants: true,
      },
    });

    if (!battle) {
      return next(createAppError('Battle not found', 404));
    }

    // Check if battle is accessible
    if (battle.status === BattleStatus.CANCELLED) {
      return next(createAppError('This battle has been cancelled', 403));
    }

    // Check if user is the creator
    const isCreator = battle.user_id === userId;

    // Check if user is a participant
    const isParticipant = battle.participants.some(
      (p: any) => p.user_id === userId
    );

    // Add battle and access info to request
    req.battle = battle;
    req.battleAccess = {
      isCreator,
      isParticipant,
    };

    next();
  } catch (error) {
    next(error);
  }
};
