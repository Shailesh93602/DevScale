import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export default class QuizAnswerRepository extends BaseRepository<
  PrismaClient['quizAnswer']
> {
  constructor() {
    super(prisma.quizAnswer);
  }
}
