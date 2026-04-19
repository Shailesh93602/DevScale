import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// ─── Mock Redis ────────────────────────────────────────────────────────────────
jest.mock('../../services/cacheService', () => ({
  redis: {
    setex: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
    exists: jest.fn(),
    call: jest.fn(),
    status: 'ready',
    quit: jest.fn(),
  },
}));

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: { $disconnect: jest.fn() },
}));

// ─── Mock Logger ───────────────────────────────────────────────────────────────
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { requirePro, requireTeam } from '../../middlewares/subscriptionGating';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function makeReqWithSubscription(tier: string, status: string): Request {
  return {
    user: {
      id: 'user-123',
      subscription: { tier, status },
    },
    headers: {},
  } as unknown as Request;
}

function makeRes(): Response {
  return {} as unknown as Response;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('subscriptionGating Middleware', () => {
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = makeRes();
    next = jest.fn() as jest.Mock;
  });

  // ── requirePro ────────────────────────────────────────────────────────────
  describe('requirePro', () => {
    it('should allow access for active Pro users', () => {
      const req = makeReqWithSubscription('pro', 'active');
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for Team users (Pro is a subset)', () => {
      const req = makeReqWithSubscription('team', 'active');
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for trialing Pro users', () => {
      const req = makeReqWithSubscription('pro', 'trialing');
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for free users', () => {
      const req = makeReqWithSubscription('free', 'active');
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Pro'),
        })
      );
    });

    it('should deny access for canceled Pro users', () => {
      const req = makeReqWithSubscription('pro', 'canceled');
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 401 when user is not authenticated', () => {
      const req = { headers: {} } as unknown as Request;
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('should deny when user has no subscription', () => {
      const req = {
        user: { id: 'user-123' },
        headers: {},
      } as unknown as Request;
      requirePro(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ── requireTeam ───────────────────────────────────────────────────────────
  describe('requireTeam', () => {
    it('should allow access for active Team users', () => {
      const req = makeReqWithSubscription('team', 'active');
      requireTeam(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should allow access for trialing Team users', () => {
      const req = makeReqWithSubscription('team', 'trialing');
      requireTeam(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access for Pro users (Team only)', () => {
      const req = makeReqWithSubscription('pro', 'active');
      requireTeam(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Team'),
        })
      );
    });

    it('should deny access for free users', () => {
      const req = makeReqWithSubscription('free', 'active');
      requireTeam(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 401 when user is not authenticated', () => {
      const req = { headers: {} } as unknown as Request;
      requireTeam(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
