import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export default class ChatRepository extends BaseRepository<
  PrismaClient['chat']
> {
  constructor() {
    super(prisma.chat);
  }
}
