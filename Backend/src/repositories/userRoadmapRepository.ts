import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class UserRoadmapRepository extends BaseRepository<
  PrismaClient['userRoadmap']
> {
  constructor() {
    super(prisma.userRoadmap);
  }
}
