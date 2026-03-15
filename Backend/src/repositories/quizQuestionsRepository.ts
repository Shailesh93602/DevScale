import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export default class QuizQuestionsRepository extends BaseRepository<
  PrismaClient['quizQuestion']
> {
  constructor() {
    super(prisma.quizQuestion);
  }
}
