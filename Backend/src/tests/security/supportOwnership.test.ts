/**
 * eduscale-backend#24-04 — support tickets took their owner from the body.
 *
 * The controllers spread `{ ...req.body, userId }` but the repository reads
 * `user_id`, so the required column came from whatever the client sent (or
 * was missing). The schemas were "applied" by calling validateRequest(schema,
 * body) inside the handler, which builds a middleware and never runs it.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const created: Record<string, Array<Record<string, unknown>>> = {
  supportTicket: [],
  bugReport: [],
  featureRequest: [],
};
const model = (name: string) => ({
  create: async ({ data }: { data: Record<string, unknown> }) => {
    created[name].push(data);
    return { id: `${name}-1`, ...data };
  },
});
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    supportTicket: model('supportTicket'),
    bugReport: model('bugReport'),
    featureRequest: model('featureRequest'),
  },
}));

import SupportController from '../../controllers/supportController';
import { SupportRoutes } from '../../routes/supportRoutes';

const controller = new SupportController();
const asUser = (body: Record<string, unknown>) => ({
  body,
  user: { id: 'session-user' } as never,
});

describe('support records belong to the session user', () => {
  beforeEach(() => {
    for (const k of Object.keys(created)) created[k].length = 0;
  });

  it('ticket: user_id is the caller even when the body names someone else', async () => {
    await runHandler(
      controller.createTicket,
      asUser({
        title: 'Broken page',
        description: 'It does not load',
        category: 'bug',
        priority: 'low',
        user_id: 'victim',
      })
    );
    expect(created.supportTicket[0]?.user_id).toBe('session-user');
  });

  it('bug report: owner from the session, steps_to_reproduce persisted', async () => {
    await runHandler(
      controller.createBugReport,
      asUser({
        title: 'Crash on save',
        description: 'Saving crashes',
        severity: 'high',
        steps_to_reproduce: '1. save',
      })
    );
    expect(created.bugReport[0]).toMatchObject({
      user_id: 'session-user',
      steps_to_reproduce: '1. save',
    });
  });

  it('feature request: owner from the session', async () => {
    await runHandler(
      controller.createFeatureRequest,
      asUser({
        title: 'Dark mode',
        description: 'Please add it',
        category: 'ui',
        priority: 'low',
      })
    );
    expect(created.featureRequest[0]?.user_id).toBe('session-user');
  });
});

describe('support create routes run their schema as middleware', () => {
  type Layer = {
    route?: {
      path: string;
      methods: Record<string, boolean>;
      stack: Array<{ name?: string }>;
    };
  };
  const router = new SupportRoutes().getRouter() as unknown as {
    stack: Layer[];
  };
  it.each(['/tickets', '/bug-reports', '/feature-requests', '/help-articles'])(
    'POST %s',
    (path) => {
      const layer = router.stack.find(
        (l) => l.route?.path === path && l.route.methods.post
      );
      expect(layer?.route?.stack.map((h) => h.name)).toContain(
        'validateRequest'
      );
    }
  );
});
