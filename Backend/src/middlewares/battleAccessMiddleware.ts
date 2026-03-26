import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createAppError } from '../utils/errorHandler';
import { Prisma } from '@prisma/client';

type BattleWithParticipants = Prisma.BattleGetPayload<{
  include: { participants: true };
}>;

/**
 * Verifies the authenticated user is the creator or a participant of the battle.
 * Attaches `req.battle` and `req.battleAccess` for downstream use.
 */
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

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
      include: { participants: true },
    });

    if (!battle) return next(createAppError('Battle not found', 404));
    if (battle.status === 'CANCELLED') {
      return next(createAppError('This battle has been cancelled', 403));
    }

    const isCreator = battle.user_id === userId;
    const isParticipant = battle.participants.some((p) => p.user_id === userId);

    req.battle = battle as BattleWithParticipants;
    req.battleAccess = { isCreator, isParticipant };

    next();
  } catch (error) {
    next(error);
  }
};
