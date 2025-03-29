import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export default class ChatRepository extends BaseRepository<
  PrismaClient['chat']
> {
  constructor() {
    super(prisma.chat);
  }
}
