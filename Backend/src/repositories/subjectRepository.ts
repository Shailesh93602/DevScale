import type { Subject } from '@prisma/client';
import BaseRepository from './baseRepository.js';

import prisma from '../lib/prisma.js';

export default class SubjectRepository extends BaseRepository< Subject, typeof prisma.subject > {
  constructor() {
    super(prisma.subject);
  }
}
