import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class QuizQuestionsRepository extends BaseRepository< QuizQuestion, typeof prisma.quizQuestion > {
  constructor() {
    super(prisma.quizQuestion);
  }
}
