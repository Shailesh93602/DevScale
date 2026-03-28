import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// ─── Mock Redis ────────────────────────────────────────────────────────────────
const mockRedis = {
  setex: jest.fn().mockResolvedValue('OK' as never),
  del: jest.fn().mockResolvedValue(1 as never),
  get: jest.fn().mockResolvedValue(null as never),
  exists: jest.fn().mockResolvedValue(0 as never),
  call: jest.fn().mockResolvedValue(null as never),
  status: 'ready',
  quit: jest.fn(),
  incr: jest.fn().mockResolvedValue(1 as never),
  expire: jest.fn().mockResolvedValue(1 as never),
};
jest.mock('../../services/cacheService', () => ({
  redis: mockRedis,
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

// ─── Mock authMiddleware ───────────────────────────────────────────────────────
jest.mock('../../middlewares/authMiddleware', () => ({
  clearAuthCache: jest.fn().mockResolvedValue(undefined as never),
}));

// ─── Mock accountLockout ───────────────────────────────────────────────────────
jest.mock('../../middlewares/accountLockout', () => ({
  recordAuthFailure: jest.fn().mockResolvedValue(undefined as never),
  clearAuthFailures: jest.fn().mockResolvedValue(undefined as never),
}));

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
const mockRefreshSession = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { refreshSession: mockRefreshSession },
  }),
}));

// ─── Mock jsonwebtoken ─────────────────────────────────────────────────────────
jest.mock('jsonwebtoken', () => ({
  decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
}));

import { logout, refreshToken, setRefreshCookie, refreshCache } from '../../controllers/authController';
import { clearAuthCache } from '../../middlewares/authMiddleware';
import { recordAuthFailure, clearAuthFailures } from '../../middlewares/accountLockout';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: { authorization: 'Bearer test-jwt-token' },
    cookies: {},
    body: {},
    user: { id: 'user-123' } as Request['user'],
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('AuthController', () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    req = makeReq();
    res = makeRes();
    next = jest.fn() as jest.Mock;
  });

  // ── logout ────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('should blocklist the JWT in Redis and return success', async () => {
      await logout(req, res, next as NextFunction);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('eduscale:auth:blocklist:'),
        expect.any(Number),
        '1',
      );
      expect(clearAuthCache).toHaveBeenCalledWith('test-jwt-token');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Logged out successfully' }),
      );
    });

    it('should call next with error when no token is provided', async () => {
      req = makeReq({ headers: {} });
      await logout(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 }),
      );
    });
  });

  // ── refreshToken ──────────────────────────────────────────────────────────
  describe('refreshToken', () => {
    it('should return new access_token on valid refresh', async () => {
      req = makeReq({
        cookies: { 'sb-refresh-token': 'valid-refresh-token' },
      });

      mockRefreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'new-access-token',
            refresh_token: 'new-refresh-token',
            expires_in: 3600,
          },
          user: { id: 'user-123' },
        },
        error: null,
      } as never);

      await refreshToken(req, res, next as NextFunction);

      expect(clearAuthFailures).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(
        'sb-refresh-token',
        'new-refresh-token',
        expect.objectContaining({ httpOnly: true, sameSite: 'strict' }),
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, access_token: 'new-access-token' }),
      );
    });

    it('should return 401 when no refresh cookie is present', async () => {
      req = makeReq({ cookies: {} });
      await refreshToken(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });

    it('should return 401 and record failure on invalid refresh token', async () => {
      req = makeReq({
        cookies: { 'sb-refresh-token': 'invalid-token' },
      });
      mockRefreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid token' },
      } as never);

      await refreshToken(req, res, next as NextFunction);

      expect(recordAuthFailure).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('sb-refresh-token');
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 401 }),
      );
    });
  });

  // ── setRefreshCookie ──────────────────────────────────────────────────────
  describe('setRefreshCookie', () => {
    it('should set httpOnly cookie with the refresh token', async () => {
      req = makeReq({ body: { refresh_token: 'my-refresh-token' } });
      await setRefreshCookie(req, res, next as NextFunction);

      expect(res.cookie).toHaveBeenCalledWith(
        'sb-refresh-token',
        'my-refresh-token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should return 400 when refresh_token is missing', async () => {
      req = makeReq({ body: {} });
      await setRefreshCookie(req, res, next as NextFunction);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 400 }),
      );
    });
  });

  // ── refreshCache ──────────────────────────────────────────────────────────
  describe('refreshCache', () => {
    it('should clear the auth cache and return success', async () => {
      await refreshCache(req, res, next as NextFunction);

      expect(clearAuthCache).toHaveBeenCalledWith('test-jwt-token');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: 'Auth cache cleared' }),
      );
    });
  });
});
