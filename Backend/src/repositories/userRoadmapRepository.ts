import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export default class UserRoadmapRepository extends BaseRepository<
  PrismaClient['userRoadmap']
> {
  constructor() {
    super(prisma.userRoadmap);
  }
}
