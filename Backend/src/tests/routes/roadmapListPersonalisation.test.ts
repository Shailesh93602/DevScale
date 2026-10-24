// GET /roadmaps personalises for a signed-in reader and never lets that reach the shared anonymous cache.
// Real router, middleware, controller and repository over an in-memory Redis and a fake Prisma.
import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
} from '@jest/globals';
import crypto from 'node:crypto';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import express from 'express';

const mockStore = new Map<string, string>();
jest.mock('../../services/cacheService', () => ({
  redis: {
    get: async (k: string) => mockStore.get(k) ?? null,
    exists: async () => 0,
    disconnect: () => undefined,
  },
  getCache: async (k: string) => {
    const v = mockStore.get(k);
    return v ? JSON.parse(v) : null;
  },
  setCache: async (k: string, v: unknown) => {
    mockStore.set(k, JSON.stringify(v));
  },
  deleteCache: async (k: string) => void mockStore.delete(k),
  invalidateCachePattern: async () => undefined,
}));
jest.mock('../../middlewares/rateLimiter', () => ({
  redisClient: null,
  createRateLimiter: () => (_req: unknown, _res: unknown, next: () => void) =>
    next(),
}));
jest.mock('../../utils/verifySupabaseToken', () => ({
  verifySupabaseToken: async () => {
    throw new Error('invalid token');
  },
}));

// A enrolled in and liked r1, and authored r2.
const mockEnrolments = [{ id: 'ur1', user_id: 'A', roadmap_id: 'r1' }];
const mockLikes = [{ id: 'l1', user_id: 'A', roadmap_id: 'r1' }];
const mockRoadmaps = ['r1', 'r2', 'r3'].map((id) => ({
  id,
  title: id,
  user_id: id === 'r2' ? 'A' : 'author',
  is_public: true,
  popularity: 0,
  estimatedHours: null,
}));
type Where = {
  user_id?: string;
  user_roadmaps?: { some: { user_id: string } };
};
type Rel = { where?: { user_id: string } } | false | undefined;
const mockMatches = (r: { id: string; user_id: string }, where: Where) =>
  (!where.user_id || r.user_id === where.user_id) &&
  (!where.user_roadmaps ||
    mockEnrolments.some(
      (e) =>
        e.roadmap_id === r.id && e.user_id === where.user_roadmaps!.some.user_id
    ));
const mockViewerRows = (
  rows: Array<{ id: string; user_id: string; roadmap_id: string }>,
  r: { id: string },
  rel: Rel
) =>
  rel && rel.where
    ? rows
        .filter(
          (x) => x.roadmap_id === r.id && x.user_id === rel.where!.user_id
        )
        .map((x) => ({ id: x.id }))
    : undefined;
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    roadmap: {
      count: async ({ where }: { where: Where }) =>
        mockRoadmaps.filter((r) => mockMatches(r, where)).length,
      findMany: async ({
        where,
        include,
      }: {
        where: Where;
        include: { likes: Rel; user_roadmaps: Rel };
      }) =>
        mockRoadmaps
          .filter((r) => mockMatches(r, where))
          .map((r) => ({
            ...r,
            user: { id: r.user_id },
            category: null,
            topics: [],
            _count: { likes: 1, comments: 0, user_roadmaps: 1, topics: 0 },
            likes: mockViewerRows(mockLikes, r, include.likes),
            user_roadmaps: mockViewerRows(
              mockEnrolments,
              r,
              include.user_roadmaps
            ),
          })),
    },
    userProgress: { findMany: async () => [] },
  },
}));

import { RoadMapRoutes } from '../../routes/roadMapRoutes';

// optionalAuthMiddleware reads its session from Redis by SHA-256(token).
const signIn = (token: string, id: string) =>
  mockStore.set(
    'eduscale:auth:' + crypto.createHash('sha256').update(token).digest('hex'),
    JSON.stringify({ user: { id }, userData: { id, status: 'active' } })
  );

let server: Server;
let base: string;
beforeAll(async () => {
  const app = express();
  app.use('/roadmaps', new RoadMapRoutes().getRouter());
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise((r) => server.close(r)));
beforeEach(() => {
  mockStore.clear();
  signIn('token-A', 'A');
});

interface Card {
  id: string;
  isEnrolled: boolean;
  isLiked: boolean;
}
async function list(query: string, token?: string): Promise<Card[]> {
  const res = await fetch(`${base}/roadmaps${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  expect(res.status).toBe(200);
  return ((await res.json()) as { data: Card[] }).data;
}
const byId = (cards: Card[], id: string) => cards.find((c) => c.id === id);
const ids = (cards: Card[]) => cards.map((c) => c.id);
const personalised = (cards: Card[]) =>
  ids(cards.filter((c) => c.isEnrolled || c.isLiked));
const httpKeys = () =>
  [...mockStore.keys()].filter((k) => k.startsWith('http:'));

describe('GET /roadmaps for a signed-in reader', () => {
  it('fills isEnrolled and isLiked on the list cards', async () => {
    const cards = await list('', 'token-A');
    expect(byId(cards, 'r1')).toMatchObject({
      isEnrolled: true,
      isLiked: true,
    });
    expect(byId(cards, 'r3')).toMatchObject({
      isEnrolled: false,
      isLiked: false,
    });
  });

  it('type=enrolled returns only the roadmaps they are enrolled in', async () => {
    expect(ids(await list('?type=enrolled', 'token-A'))).toEqual(['r1']);
  });

  it('type=my-roadmaps returns only the roadmaps they authored', async () => {
    expect(ids(await list('?type=my-roadmaps', 'token-A'))).toEqual(['r2']);
  });
});

describe('the shared anonymous cache never carries personalised data', () => {
  it('a signed-in request writes nothing to the shared response cache', async () => {
    await list('', 'token-A');
    await list('?type=enrolled', 'token-A');
    expect(httpKeys()).toEqual([]);
  });

  it('signed in first, then anonymous: the anonymous reader sees no one’s enrolments or likes', async () => {
    await list('', 'token-A');
    await list('?type=enrolled', 'token-A');
    expect(personalised(await list(''))).toEqual([]);
    expect(ids(await list('?type=enrolled'))).toEqual(['r1', 'r2', 'r3']);
    expect(httpKeys()).toHaveLength(2);
    for (const key of httpKeys()) {
      expect(mockStore.get(key)).not.toMatch(/"is(Enrolled|Liked)":true/);
    }
  });

  it('anonymous first, then signed in: the signed-in reader is not served the anonymous copy', async () => {
    expect(personalised(await list(''))).toEqual([]);
    expect(httpKeys()).toHaveLength(1);
    expect(personalised(await list('', 'token-A'))).toEqual(['r1']);
  });

  it('a token that does not verify is read as anonymous', async () => {
    expect(personalised(await list('', 'not-a-session'))).toEqual([]);
  });
});
