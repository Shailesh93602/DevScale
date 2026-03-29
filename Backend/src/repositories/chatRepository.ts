import type { Chat } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class ChatRepository extends BaseRepository< Chat, typeof prisma.chat > {
  constructor() {
    super(prisma.chat);
  }
}
