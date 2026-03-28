import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class QuizSubmissionRepository extends BaseRepository< QuizSubmission, typeof prisma.quizSubmission > {
  constructor() {
    super(prisma.quizSubmission);
  }
}
