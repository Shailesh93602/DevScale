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
const mockPrisma = {
  user: { findUnique: jest.fn() },
  $disconnect: jest.fn(),
};
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: mockPrisma,
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

// ─── Mock RBACRepository ───────────────────────────────────────────────────────
const mockCheckPermission = jest.fn();
jest.mock('../../repositories/rbacRepository', () => ({
  RBACRepository: jest.fn().mockImplementation(() => ({
    checkPermission: mockCheckPermission,
  })),
}));

import { authorizeRoles } from '../../middlewares/authMiddleware';
import {
  requirePermission,
  requireRole,
} from '../../middlewares/rbacMiddleware';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(roleName?: string): Request {
  const user: Record<string, unknown> = { id: 'user-123' };
  if (roleName) {
    user.role = { name: roleName };
  }
  return { user, headers: {} } as unknown as Request;
}

function makeRes(): Response {
  return {} as unknown as Response;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('RBAC Middleware', () => {
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = makeRes();
    next = jest.fn() as jest.Mock;
  });

  // ── authorizeRoles ────────────────────────────────────────────────────────
  describe('authorizeRoles', () => {
    it('should allow access when user has an allowed role', () => {
      const middleware = authorizeRoles('ADMIN', 'MODERATOR');
      const req = makeReq('ADMIN');
      middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access when user has a different role', () => {
      const middleware = authorizeRoles('ADMIN');
      const req = makeReq('STUDENT');
      middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 401 when user is not set', () => {
      const middleware = authorizeRoles('ADMIN');
      const req = { headers: {} } as unknown as Request;
      middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });

    it('should deny access when user has no role', () => {
      const middleware = authorizeRoles('ADMIN');
      const req = { user: { id: 'u1' }, headers: {} } as unknown as Request;
      middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  // ── requirePermission ─────────────────────────────────────────────────────
  describe('requirePermission', () => {
    it('should allow access when user has the required permission', async () => {
      mockCheckPermission.mockResolvedValue(true as never);
      const middleware = requirePermission('articles', 'delete');
      const req = makeReq('ADMIN');
      await middleware(req, res, next as NextFunction);
      expect(mockCheckPermission).toHaveBeenCalledWith(
        'user-123',
        'articles',
        'delete'
      );
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access (403) when user lacks the permission', async () => {
      mockCheckPermission.mockResolvedValue(false as never);
      const middleware = requirePermission('articles', 'delete');
      const req = makeReq('STUDENT');
      await middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const middleware = requirePermission('articles', 'delete');
      const req = { headers: {} } as unknown as Request;
      await middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });

  // ── requireRole ───────────────────────────────────────────────────────────
  describe('requireRole', () => {
    it('should allow access when user has the required role (via DB lookup)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        role: { name: 'ADMIN' },
      } as never);

      const middleware = requireRole('ADMIN');
      const req = makeReq('ADMIN');
      await middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith();
    });

    it('should deny access when user has a different role in DB', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        role: { name: 'STUDENT' },
      } as never);

      const middleware = requireRole('ADMIN');
      const req = makeReq('STUDENT');
      await middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });

    it('should return 401 when user is not authenticated', async () => {
      const middleware = requireRole('ADMIN');
      const req = { headers: {} } as unknown as Request;
      await middleware(req, res, next as NextFunction);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 })
      );
    });
  });
});
