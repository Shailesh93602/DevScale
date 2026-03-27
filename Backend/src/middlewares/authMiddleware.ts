import { NextFunction, Request, Response } from 'express';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import crypto from 'node:crypto';
import { redis } from '../services/cacheService';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
);

// ─── Token Blocklist ─────────────────────────────────────────────────────────
const TOKEN_BLOCKLIST_PREFIX = 'eduscale:auth:blocklist:';

const isTokenBlocklisted = async (token: string): Promise<boolean> => {
  try {
    const key = TOKEN_BLOCKLIST_PREFIX + crypto.createHash('sha256').update(token).digest('hex');
    return (await redis.exists(key)) === 1;
  } catch {
    return false;
  }
};

// ─── Redis Auth Cache ───
const AUTH_CACHE_TTL_SECONDS = 5 * 60;
const AUTH_CACHE_PREFIX = 'eduscale:auth:';

const tokenCacheKey = (token: string) =>
  AUTH_CACHE_PREFIX + crypto.createHash('sha256').update(token).digest('hex');

interface AuthCacheData {
  user: SupabaseUser;
  userData: Request['user'];
}

const getAuthCache = async (token: string): Promise<AuthCacheData | null> => {
  try {
    const raw = await redis.get(tokenCacheKey(token));
    return raw ? JSON.parse(raw) as AuthCacheData : null;
  } catch {
    return null;
  }
};

const setAuthCache = async (token: string, user: SupabaseUser, userData: Request['user']) => {
  try {
    await redis.setex(
      tokenCacheKey(token),
      AUTH_CACHE_TTL_SECONDS,
      JSON.stringify({ user, userData })
    );
  } catch {
    // non-fatal
  }
};

export const clearAuthCache = async (token: string) => {
  try {
    await redis.del(tokenCacheKey(token));
  } catch {
    // non-fatal
  }
};

const splitFullName = (fullName?: string) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

// ─── Main Auth Middleware (Required) ──────────────────────────────────────────
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(createAppError('Authorization token required', 401));
    }

    if (await isTokenBlocklisted(token)) {
      return next(createAppError('Token has been revoked', 401));
    }

    const cached = await getAuthCache(token);
    if (cached) {
      req.user = cached.userData;
      req.supabaseUser = cached.user;
      return next();
    }

    let user: SupabaseUser | null = null;
    try {
      const { jwtVerify, createRemoteJWKSet } = await import('jose');
      const JWKS_INTERNAL = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
      const { payload } = await jwtVerify(token, JWKS_INTERNAL);

      user = {
        id: payload.sub,
        email: payload.email as string,
        user_metadata: (payload.user_metadata as Record<string, unknown>) || {},
      } as unknown as SupabaseUser;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.warn(`Local JWT verification failed: ${errorMessage}. Falling back to Supabase HTTP API.`);
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return next(createAppError('Invalid authentication token', 401));
      }
      user = data.user;
    }

    let userData = (await prisma.user.findUnique({
      where: { supabase_id: user.id },
      include: { role: true },
    })) as unknown as Request['user'];

    if (!userData) {
      const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
      const metadata = user.user_metadata as Record<string, unknown>;
      const fullName = metadata.full_name as string;
      
      userData = (await (prisma.user.create({
        data: {
          supabase_id: user.id,
          email: user.email ?? '',
          username: (user.email?.split('@')[0] || 'user') + '_' + Math.floor(Math.random() * 1000),
          first_name: (metadata.first_name as string) || splitFullName(fullName).firstName,
          last_name: (metadata.last_name as string) || splitFullName(fullName).lastName,
          avatar_url: (metadata.avatar_url as string) || '',
          role_id: studentRole?.id,
          status: 'active',
          is_active: true,
        },
        include: { role: true },
      }))) as unknown as Request['user'];
      logger.info('New user synced from Supabase', { userId: userData.id });
    } else {
      const metadata = user.user_metadata as Record<string, unknown>;
      const needsSync =
        (metadata.first_name && userData.first_name !== metadata.first_name) ||
        (metadata.last_name && userData.last_name !== metadata.last_name) ||
        (metadata.avatar_url && userData.avatar_url !== metadata.avatar_url);

      if (needsSync) {
        userData = (await prisma.user.update({
          where: { id: userData.id },
          data: {
            first_name: (metadata.first_name as string) || userData.first_name,
            last_name: (metadata.last_name as string) || userData.last_name,
            avatar_url: (metadata.avatar_url as string) || userData.avatar_url,
          },
          include: { role: true },
        })) as unknown as Request['user'];
      }
    }

    await setAuthCache(token, user, userData);
    req.user = userData;
    req.supabaseUser = user;

    next();
  } catch (err) {
    logger.error('Authentication process failed', { error: err });
    next(createAppError('Authentication failed', 401));
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  const cached = await getAuthCache(token);
  if (cached) {
    req.user = cached.userData;
    req.supabaseUser = cached.user;
    return next();
  }

  let user: SupabaseUser | null = null;
  try {
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const JWKS_INTERNAL = createRemoteJWKSet(new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
    const { payload } = await jwtVerify(token, JWKS_INTERNAL);
    user = {
      id: payload.sub,
      email: payload.email as string,
      user_metadata: (payload.user_metadata as Record<string, unknown>) || {},
    } as unknown as SupabaseUser;
  } catch {
    const { data } = await supabase.auth.getUser(token);
    if (data?.user) user = data.user;
  }

  if (user) {
    try {
      const userData = (await prisma.user.findUnique({
        where: { supabase_id: user.id },
        include: { role: true },
      })) as unknown as Request['user'];
      
      if (userData) {
        await setAuthCache(token, user, userData);
        req.user = userData;
        req.supabaseUser = user;
      }
    } catch {
      // silent
    }
  }
  next();
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError('Unauthorized - Login required', 401));
    }
    const userRoleName = req.user.role?.name;
    if (!userRoleName || !allowedRoles.includes(userRoleName)) {
      return next(createAppError('Insufficient permissions', 403));
    }
    next();
  };
};
