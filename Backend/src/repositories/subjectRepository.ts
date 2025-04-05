import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '@/lib/prisma';

export default class SubjectRepository extends BaseRepository<
  PrismaClient['subject']
> {
  constructor() {
    super(prisma.subject);
  }
}
