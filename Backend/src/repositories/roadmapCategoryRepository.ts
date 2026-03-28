import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class RoadmapCategoryRepository extends BaseRepository<
  PrismaClient['roadmapCategory']
> {
  constructor() {
    super(prisma.roadmapCategory);
  }
}
