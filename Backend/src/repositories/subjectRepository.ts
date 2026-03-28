import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class SubjectRepository extends BaseRepository<
  PrismaClient['subject']
> {
  constructor() {
    super(prisma.subject);
  }
}
