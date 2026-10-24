// The dashboard summary cache lives in Redis, so a write on one instance is seen by every other one.
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const mockStore = new Map<string, string>();
const mockTtls = new Map<string, number | undefined>();
jest.mock('../../services/cacheService', () => ({
  getCache: async (k: string) => {
    const v = mockStore.get(k);
    return v ? JSON.parse(v) : null;
  },
  setCache: async (k: string, v: unknown, o: { ttl?: number } = {}) => {
    mockStore.set(k, JSON.stringify(v));
    mockTtls.set(k, o.ttl);
  },
  deleteCache: async (k: string) => void mockStore.delete(k),
  invalidateCachePattern: async () => undefined,
}));

const mockEnrolments: Array<{ user_id: string; roadmap_id: string }> = [];
const mockSummaryQueries = { count: 0 };
const mockTx = {
  userStreak: {
    upsert: async () => ({}),
    findUnique: async () => ({ last_activity_date: null }),
    update: async () => ({}),
  },
  userDailyActivity: { create: async () => ({}) },
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { update: async () => ({}) },
    roadmap: {
      findUnique: async ({ where }: { where: { id: string } }) => ({
        id: where.id,
        user_roadmaps: mockEnrolments.filter((e) => e.roadmap_id === where.id),
      }),
    },
    userRoadmap: {
      findFirst: async () => null,
      create: async ({ data }: { data: (typeof mockEnrolments)[number] }) => {
        mockEnrolments.push(data);
        return data;
      },
    },
    userProgress: { upsert: async () => ({}) },
    userActivityLog: { create: async () => ({}) },
    quiz: {
      findUnique: async () => ({
        id: 'quiz-1',
        topic_id: 't1',
        passing_score: 0,
        questions: [{ id: 'q1', points: 1, type: 'mcq', correct_answer: 'a' }],
      }),
    },
    quizSubmission: {
      create: async (a: { data: Record<string, unknown> }) => a.data,
    },
    $transaction: async (arg: unknown) =>
      typeof arg === 'function' ? arg(mockTx) : Promise.all(arg as unknown[]),
    $queryRaw: async () => {
      mockSummaryQueries.count += 1;
      return [{ enrolled_count: mockEnrolments.length }];
    },
  },
}));
jest.mock('../../utils/codeExecutor', () => ({ executeCode: jest.fn() }));

type Summary = { stats: { enrolledRoadmaps: number } };
interface Instance {
  dashboard: { getDashboardSummary(id: string): Promise<unknown> };
  roadmaps: { enrollRoadMap: Parameters<typeof runHandler>[0] };
}
// Each instance gets its own module registry, as each Vercel function instance has its own memory.
function bootInstance(): Instance {
  let instance!: Instance;
  jest.isolateModules(() => {
    const { DashboardRepository } = jest.requireActual<
      typeof import('../../repositories/dashboardRepository')
    >('../../repositories/dashboardRepository');
    const RoadmapController = jest.requireActual<
      typeof import('../../controllers/roadMapControllers')
    >('../../controllers/roadMapControllers').default;
    instance = {
      dashboard: new DashboardRepository(),
      roadmaps: new RoadmapController(),
    };
  });
  return instance;
}

const KEY = 'dashboard:summary:u1';
beforeEach(() => {
  mockStore.clear();
  mockTtls.clear();
  mockEnrolments.length = 0;
  mockSummaryQueries.count = 0;
});

describe('dashboard summary cache', () => {
  it('is stored in the shared cache for 5 minutes and served from it', async () => {
    const a = bootInstance();
    const b = bootInstance();
    await a.dashboard.getDashboardSummary('u1');
    expect(mockTtls.get(KEY)).toBe(300);
    await b.dashboard.getDashboardSummary('u1');
    expect(mockSummaryQueries.count).toBe(1);
  });

  it('an enrolment on one instance is visible on another instance at once', async () => {
    const a = bootInstance();
    const b = bootInstance();
    const before = (await a.dashboard.getDashboardSummary('u1')) as Summary;
    expect(before.stats.enrolledRoadmaps).toBe(0);

    const out = await runHandler(b.roadmaps.enrollRoadMap, {
      body: { roadmapId: 'r1' },
      user: { id: 'u1' } as never,
    });
    expect(out.status).toBeLessThan(300);

    const after = (await a.dashboard.getDashboardSummary('u1')) as Summary;
    expect(after.stats.enrolledRoadmaps).toBe(1);
  });
});

describe('every write the summary reads drops the shared copy', () => {
  const seed = () => mockStore.set(KEY, JSON.stringify({ stale: true }));

  it.each<[string, () => Promise<unknown>]>([
    [
      'bookmark',
      async () => {
        const { toggleRoadmapBookmark } = await import(
          '../../controllers/roadmap/roadmapEngagement'
        );
        return toggleRoadmapBookmark('u1', 'r1');
      },
    ],
    [
      'progress update',
      async () => {
        const { default: C } = await import(
          '../../controllers/userProgressController'
        );
        return runHandler(new C().updateProgress, {
          body: { topicId: 't1', status: 'in_progress' },
          user: { id: 'u1' } as never,
        });
      },
    ],
    [
      'passed topic quiz',
      async () => {
        const { default: Q } = await import(
          '../../repositories/quizRepository'
        );
        return new Q().submitQuiz({
          user_id: 'u1',
          quiz_id: 'quiz-1',
          answers: [{ question_id: 'q1', answer: 'a' }],
          time_spent: 0,
        });
      },
    ],
    [
      'streak activity',
      async () => {
        const { default: S } = await import(
          '../../repositories/streakRepository'
        );
        return new S().updateStreak('u1', {
          activityType: 'LEARNING' as never,
          minutesSpent: 5,
          timezone: 'UTC',
        });
      },
    ],
    [
      'admin bulk action (activity log)',
      async () => {
        const { default: U } = await import(
          '../../repositories/userRepository'
        );
        return new U().bulkUpdateUsers(['u1'], 'activate');
      },
    ],
  ])('%s', async (_name, write) => {
    seed();
    await write();
    expect(mockStore.has(KEY)).toBe(false);
  });
});
