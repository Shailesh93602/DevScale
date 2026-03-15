import { PrismaClient } from '@prisma/client';
import BaseRepository from './baseRepository';

import prisma from '../lib/prisma';

export default class RoadmapCategoryRepository extends BaseRepository<
  PrismaClient['roadmapCategory']
> {
  constructor() {
    super(prisma.roadmapCategory);
  }
}
