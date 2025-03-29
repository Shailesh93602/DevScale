import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

const prisma = new PrismaClient();

export default class UserRoadmapRepository extends BaseRepository<
  PrismaClient['userRoadmap']
> {
  constructor() {
    super(prisma.userRoadmap);
  }
}
