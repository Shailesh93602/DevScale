import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { createAppError } from '../utils/errorHandler';

/**
 * Guards the join route: checks the battle is joinable and the user isn't already in it.
 */
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

    const existingParticipant = await prisma.battleParticipant.findUnique({
      where: { battle_id_user_id: { battle_id: battleId, user_id: userId } },
    });

    if (existingParticipant) {
      return next(createAppError('You are already in this battle', 409));
    }

    const battle = await prisma.battle.findUnique({
      where: { id: battleId },
    });

    if (!battle) return next(createAppError('Battle not found', 404));

    if (battle.current_participants >= battle.max_participants) {
      return next(createAppError('Battle is full', 403));
    }

    // Can join in WAITING or LOBBY state
    if (battle.status !== 'WAITING' && battle.status !== 'LOBBY') {
      return next(createAppError('Cannot join this battle — it has already started or ended', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
