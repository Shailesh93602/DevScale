import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export default class QuizQuestionsRepository extends BaseRepository<
  PrismaClient['quizQuestion']
> {
  constructor() {
    super(prisma.quizQuestion);
  }
}
