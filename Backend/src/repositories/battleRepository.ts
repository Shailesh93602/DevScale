import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export class BattleRepository extends BaseRepository<PrismaClient['battle']> {
  constructor() {
    super(prisma.battle);
  }
}
