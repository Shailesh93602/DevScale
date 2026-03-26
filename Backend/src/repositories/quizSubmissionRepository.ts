import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export default class QuizSubmissionRepository extends BaseRepository<
  PrismaClient['quizSubmission']
> {
  constructor() {
    super(prisma.quizSubmission);
  }
}
