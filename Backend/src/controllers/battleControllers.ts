import { Request, Response } from 'express';
import { catchAsync } from '../utils';
import { BattleRepository } from '@/repositories/battleRepository';
import logger from '@/utils/logger';
import { sendResponse } from '@/utils/apiResponse';
import { createAppError } from '@/utils/errorHandler';

export default class BattleController {
  private readonly battleRepo: BattleRepository;

  constructor() {
    this.battleRepo = new BattleRepository();
  }
  public getBattles = catchAsync(async (req: Request, res: Response) => {
    const battles = await this.battleRepo.findMany();
    sendResponse(res, 'BATTLES_FETCHED', { data: battles });
  });

  public getBattle = catchAsync(async (req: Request, res: Response) => {
    try {
      const battle = await this.battleRepo.findUnique({
        where: { id: req.params.id },
      });
      sendResponse(res, 'BATTLES_FETCHED', { data: battle });
    } catch (error) {
      logger.error('Error: ', error);
      createAppError('Battle not found', 404);
    }
  });

  public createBattle = catchAsync(async (req: Request, res: Response) => {
    const { title, description, topic_id, difficulty, length, date, time } =
      req.body;

    await this.battleRepo.create({
      data: {
        title,
        description,
        topic_id,
        difficulty,
        length,
        date,
        time,
        user_id: req.user?.id ?? '',
      },
    });

    sendResponse(res, 'BATTLE_CREATED');
  });
}
