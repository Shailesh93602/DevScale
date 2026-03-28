import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class QuizQuestionsRepository extends BaseRepository<
  PrismaClient['quizQuestion']
> {
  constructor() {
    super(prisma.quizQuestion);
  }
}
