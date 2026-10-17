// eduscale-backend#22-10 / #22-09 — roadmap writes must drop the Redis detail cache.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const invalidated: string[] = [];
jest.mock('../../services/cacheService', () => ({
  invalidateCachePattern: async (p: string) => void invalidated.push(p),
  getCache: async () => null,
  setCache: async () => undefined,
}));

const roadmapRow = { id: 'r1', user_id: 'owner', title: 't', description: 'd' };
let roadmapExists = true;
const userRoadmapCreate = jest.fn(async () => ({}));
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    roadmap: {
      findUnique: async () => (roadmapExists ? { id: 'r1' } : null),
    },
    like: {
      findFirst: async () => null,
      create: async () => ({}),
    },
    userRoadmap: {
      findFirst: async () => null,
      create: () => userRoadmapCreate(),
    },
  },
}));
jest.mock('../../repositories/roadmapRepository', () => ({
  __esModule: true,
  default: class {
    getRoadmap = async () => roadmapRow;
    update = async () => roadmapRow;
    delete = async () => roadmapRow;
  },
}));

import {
  toggleRoadmapBookmark,
  toggleRoadmapLike,
} from '../../controllers/roadmap/roadmapEngagement';
import RoadmapController from '../../controllers/roadMapControllers';

beforeEach(() => {
  invalidated.length = 0;
  roadmapExists = true;
  userRoadmapCreate.mockClear();
});

describe('roadmap cache invalidation', () => {
  it.each<['updateRoadMap' | 'deleteRoadMap', Record<string, string>]>([
    ['updateRoadMap', { title: 'new' }],
    ['deleteRoadMap', {}],
  ])(
    '%s drops every viewer’s cached detail and the lists',
    async (name, body) => {
      const controller = new RoadmapController();
      await runHandler(controller[name], {
        params: { id: 'r1' },
        body,
        user: { id: 'owner' } as never,
      });
      expect(invalidated).toEqual(
        expect.arrayContaining(['roadmap:detail:r1:*', 'roadmaps:list:*'])
      );
    }
  );

  it('a like drops the Redis detail for every viewer, not only the in-process map', async () => {
    await toggleRoadmapLike('u1', 'r1');
    expect(invalidated).toContain('roadmap:detail:r1:*');
  });

  it('bookmarking an unknown roadmap is a not-found, never an FK error', async () => {
    roadmapExists = false;
    await expect(toggleRoadmapBookmark('u1', 'missing')).resolves.toBeNull();
    expect(userRoadmapCreate).not.toHaveBeenCalled();
  });
});
