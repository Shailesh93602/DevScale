import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class ChatRepository extends BaseRepository<
  PrismaClient['chat']
> {
  constructor() {
    super(prisma.chat);
  }
}
