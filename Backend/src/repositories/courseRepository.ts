import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';
import prisma from '@/lib/prisma';

export class CourseRepository extends BaseRepository<PrismaClient['course']> {
  constructor() {
    super(prisma.course);
  }
}
