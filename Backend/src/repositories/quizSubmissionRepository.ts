import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export default class QuizSubmissionRepository extends BaseRepository<
  PrismaClient['quizSubmission']
> {
  constructor() {
    super(prisma.quizSubmission);
  }
}
