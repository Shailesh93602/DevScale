/**
 * eduscale-backend#24-01 — GET /placement/resources was anonymous and read
 * `?userId=` from the query, so anyone could read anyone's placement rows.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { runHandler } from '../helpers/runHandler';

const findManyArgs: Array<{ where: { user_id?: string } }> = [];
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    placementTest: {
      findMany: async (args: { where: { user_id?: string } }) => {
        findManyArgs.push(args);
        return [];
      },
    },
  },
}));

import PlacementController from '../../controllers/placementControllers';
import { PlacementRoutes } from '../../routes/placementRoutes';

describe('GET /placement/resources', () => {
  it('requires authentication', () => {
    type Layer = { route?: { path: string; stack: Array<{ name?: string }> } };
    const router = new PlacementRoutes().getRouter() as unknown as {
      stack: Layer[];
    };
    const layer = router.stack.find((l) => l.route?.path === '/resources');
    expect(layer?.route?.stack.map((h) => h.name)).toContain('authMiddleware');
  });

  it("reads the session user's rows, ignoring a ?userId= for someone else", async () => {
    const out = await runHandler(new PlacementController().getResources, {
      query: { userId: 'victim' },
      user: { id: 'me' } as never,
    });
    expect(out.error).toBeUndefined();
    expect(findManyArgs[0].where.user_id).toBe('me');
  });
});
