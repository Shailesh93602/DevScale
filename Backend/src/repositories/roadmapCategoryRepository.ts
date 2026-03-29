import type { RoadmapCategory } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class RoadmapCategoryRepository extends BaseRepository< RoadmapCategory, typeof prisma.roadmapCategory > {
  constructor() {
    super(prisma.roadmapCategory);
  }
}
