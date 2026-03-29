import type { UserRoadmap } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class UserRoadmapRepository extends BaseRepository< UserRoadmap, typeof prisma.userRoadmap > {
  constructor() {
    super(prisma.userRoadmap);
  }
}
