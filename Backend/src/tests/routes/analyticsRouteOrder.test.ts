// eduscale-backend#24-09 — GET /analytics/user/me must not be captured by /user/:userId.
import { describe, it, expect, jest } from '@jest/globals';
import express, { NextFunction, Request, Response } from 'express';
import type { AddressInfo } from 'node:net';

jest.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.user = { id: 'student-1', role: { name: 'STUDENT' } } as never;
    next();
  },
  authorizeRoles: () => (_req: Request, res: Response) =>
    res.status(403).json({ handler: 'forbidden' }),
}));
jest.mock('../../controllers/analyticsController', () => ({
  __esModule: true,
  default: class {
    getUserAnalytics = (req: Request, res: Response) =>
      res.json({ handler: 'byId', userId: req.params.userId });
    getCurrentUserAnalytics = (_req: Request, res: Response) =>
      res.json({ handler: 'me' });
    getPlatformAnalytics = jest.fn();
    generateReport = jest.fn();
  },
}));

import { AnalyticsRoutes } from '../../routes/analyticsRoutes';

describe('analytics routes', () => {
  it("a student's GET /user/me reaches getCurrentUserAnalytics", async () => {
    const app = express();
    app.use('/analytics', new AnalyticsRoutes().getRouter());
    const server = app.listen(0);
    try {
      const { port } = server.address() as AddressInfo;
      const res = await fetch(`http://127.0.0.1:${port}/analytics/user/me`);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ handler: 'me' });
    } finally {
      server.close();
    }
  });
});
