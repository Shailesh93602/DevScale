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
};
jest.mock('../../services/cacheService', () => ({
  redis: mockRedis,
}));

// ─── Mock Prisma ───────────────────────────────────────────────────────────────
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
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

// ─── Mock Supabase ─────────────────────────────────────────────────────────────
const mockGetUser = jest.fn();
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// ─── Mock jose ─────────────────────────────────────────────────────────────────
// Simulate failed local verification so it falls back to Supabase HTTP API
jest.mock('jose', () => ({
  jwtVerify: jest.fn().mockRejectedValue(new Error('test: forcing fallback') as never),
  createRemoteJWKSet: jest.fn().mockReturnValue(() => {}),
}));

import { authMiddleware, optionalAuthMiddleware, clearAuthCache } from '../../middlewares/authMiddleware';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: { authorization: 'Bearer valid-jwt-token' },
    cookies: {},
    body: {},
    ...overrides,
  } as unknown as Request;
}

function makeRes(): Response {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
}

const MOCK_USER = {
  id: 'supabase-user-id',
  email: 'test@eduscale.com',
  user_metadata: { first_name: 'Test', last_name: 'User' },
};

const MOCK_DB_USER = {
  id: 'db-user-123',
  supabase_id: 'supabase-user-id',
  email: 'test@eduscale.com',
  first_name: 'Test',
  last_name: 'User',
  avatar_url: '',
  role: { name: 'STUDENT' },
  subscription: null,
};

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('authMiddleware', () => {
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = makeRes();
    next = jest.fn() as jest.Mock;
  });

  it('should return 401 when no Authorization header is present', async () => {
    const req = makeReq({ headers: {} });
    await authMiddleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it('should return 401 when the token is blocklisted', async () => {
    mockRedis.exists.mockResolvedValue(1 as never);
    const req = makeReq();
    await authMiddleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401, message: expect.stringContaining('revoked') }),
    );
  });

  it('should use cache hit and set req.user', async () => {
    mockRedis.exists.mockResolvedValue(0 as never);
    mockRedis.get.mockResolvedValue(
      JSON.stringify({ user: MOCK_USER, userData: MOCK_DB_USER }) as never,
    );

    const req = makeReq();
    await authMiddleware(req, res, next as NextFunction);

    expect(req.user).toEqual(MOCK_DB_USER);
    expect(next).toHaveBeenCalledWith();
  });

  it('should authenticate via Supabase fallback when JWKS fails and user exists in DB', async () => {
    mockRedis.exists.mockResolvedValue(0 as never);
    mockRedis.get.mockResolvedValue(null as never);
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
    mockPrisma.user.findUnique.mockResolvedValue(MOCK_DB_USER as never);

    const req = makeReq();
    await authMiddleware(req, res, next as NextFunction);

    expect(req.user).toEqual(MOCK_DB_USER);
    expect(mockRedis.setex).toHaveBeenCalled(); // auth cache set
    expect(next).toHaveBeenCalledWith();
  });

  it('should auto-create a new user if not found in DB', async () => {
    mockRedis.exists.mockResolvedValue(0 as never);
    mockRedis.get.mockResolvedValue(null as never);
    mockGetUser.mockResolvedValue({
      data: { user: MOCK_USER },
      error: null,
    } as never);
    mockPrisma.user.findUnique.mockResolvedValue(null as never);
    mockPrisma.role.findUnique.mockResolvedValue({ id: 'role-student-id' } as never);
    mockPrisma.user.create.mockResolvedValue({ ...MOCK_DB_USER, id: 'new-user-id' } as never);

    const req = makeReq();
    await authMiddleware(req, res, next as NextFunction);

    expect(mockPrisma.user.create).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('should return 401 when Supabase getUser also fails', async () => {
    mockRedis.exists.mockResolvedValue(0 as never);
    mockRedis.get.mockResolvedValue(null as never);
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid token' },
    } as never);

    const req = makeReq();
    await authMiddleware(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });
});

describe('optionalAuthMiddleware', () => {
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = makeRes();
    next = jest.fn() as jest.Mock;
  });

  it('should call next without setting user when no token is present', async () => {
    const req = makeReq({ headers: {} });
    await optionalAuthMiddleware(req, res, next as NextFunction);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('should set user from cache when token is present and cached', async () => {
    mockRedis.get.mockResolvedValue(
      JSON.stringify({ user: MOCK_USER, userData: MOCK_DB_USER }) as never,
    );

    const req = makeReq();
    await optionalAuthMiddleware(req, res, next as NextFunction);

    expect(req.user).toEqual(MOCK_DB_USER);
    expect(next).toHaveBeenCalledWith();
  });
});

describe('clearAuthCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the cache key for the given token', async () => {
    await clearAuthCache('some-token');
    expect(mockRedis.del).toHaveBeenCalledWith(
      expect.stringContaining('eduscale:auth:'),
    );
  });
});
