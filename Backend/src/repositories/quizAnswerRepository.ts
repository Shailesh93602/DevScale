import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class QuizAnswerRepository extends BaseRepository< QuizAnswer, typeof prisma.quizAnswer > {
  constructor() {
    super(prisma.quizAnswer);
  }
}
