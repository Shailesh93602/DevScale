import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

export class BattleRepository extends BaseRepository<PrismaClient['battle']> {
  constructor() {
    super(new PrismaClient().battle);
  }
}
