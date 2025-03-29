import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export default class SubjectRepository extends BaseRepository<
  PrismaClient['subject']
> {
  constructor() {
    super(prisma.subject);
  }
}
