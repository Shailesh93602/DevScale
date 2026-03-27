import { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { redis } from '../services/cacheService';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ─── Token Blocklist ─────────────────────────────────────────────────────────
const TOKEN_BLOCKLIST_PREFIX = 'eduscale:auth:blocklist:';

const isTokenBlocklisted = async (token: string): Promise<boolean> => {
  try {
    const key = TOKEN_BLOCKLIST_PREFIX + crypto.createHash('sha256').update(token).digest('hex');
    return (await redis.exists(key)) === 1;
  } catch {
    return false; // fail open — don't block requests on Redis downtime
  }
};

// ─── Redis Auth Cache ───
// Token is hashed with SHA-256 before use as a cache key — never store raw JWTs as keys.
const AUTH_CACHE_TTL_SECONDS = 5 * 60; // 5 minutes
const AUTH_CACHE_PREFIX = 'eduscale:auth:';

const tokenCacheKey = (token: string) =>
  AUTH_CACHE_PREFIX + crypto.createHash('sha256').update(token).digest('hex');

const getAuthCache = async (token: string) => {
  try {
    const raw = await redis.get(tokenCacheKey(token));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // cache miss is non-fatal
  }
};

const setAuthCache = async (token: string, user: unknown, userData: unknown) => {
  try {
    await redis.setex(
      tokenCacheKey(token),
      AUTH_CACHE_TTL_SECONDS,
      JSON.stringify({ user, userData })
    );
  } catch {
    // cache write failure is non-fatal — request still succeeds
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

    // ─── Blocklist Check ───
    if (await isTokenBlocklisted(token)) {
      logger.info('auth:revoked_token', { ip: req.ip, ua: req.headers['user-agent'] });
      return next(createAppError('Token has been revoked', 401));
    }

    // ─── Cache Lookup ───
    const cached = await getAuthCache(token);
    if (cached) {
      req.user = cached.userData;
      req.supabaseUser = cached.user;
      return next();
    }

    // ─── Local JWT Verification (Instant) ───
    // Instead of HTTP round-trip to Supabase, try to verify JWT locally.
    let user: any = null;
    let decodedUser: any = null;
    try {
      decodedUser = jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string);

      // Map JWT claims to match the Supabase user object shape expected below
      user = {
        id: decodedUser.sub,
        email: decodedUser.email,
        user_metadata: decodedUser.user_metadata || {},
      };
    } catch (err: any) {
      logger.warn(`Local JWT verification failed: ${err.message}. Falling back to Supabase HTTP API.`);

      // ─── Fallback to Supabase API ───
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        logger.info('auth:failed', { ip: req.ip, ua: req.headers['user-agent'], error: error?.message });
        return next(createAppError('Invalid authentication token', 401));
      }
      user = data.user;
    }

    // ─── JIT User Sync & Alignment ───
    let userData = await prisma.user.findUnique({
      where: { supabase_id: user.id },
      include: { role: true },
    }) as any;

    if (!userData) {
      // Create user if missing
      const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
      userData = await prisma.user.create({
        data: {
          supabase_id: user.id,
          email: user.email!,
          username: user.email?.split('@')[0] + '_' + Math.floor(Math.random() * 1000),
          first_name: user.user_metadata?.first_name || splitFullName(user.user_metadata?.full_name).firstName,
          last_name: user.user_metadata?.last_name || splitFullName(user.user_metadata?.full_name).lastName,
          avatar_url: user.user_metadata?.avatar_url || '',
          role_id: studentRole?.id,
          status: 'active',
          is_active: true,
        },
        include: { role: true },
      }) as any;
      logger.info('New user synced from Supabase', { userId: userData.id });
    } else {
      // Optional: Check if we need to sync metadata changes (name/avatar)
      const needsSync =
        (user.user_metadata?.first_name && userData.first_name !== user.user_metadata.first_name) ||
        (user.user_metadata?.last_name && userData.last_name !== user.user_metadata.last_name) ||
        (user.user_metadata?.avatar_url && userData.avatar_url !== user.user_metadata.avatar_url);

      if (needsSync) {
        userData = await prisma.user.update({
          where: { id: userData.id },
          data: {
            first_name: user.user_metadata?.first_name || splitFullName(user.user_metadata?.full_name).firstName || (userData.first_name as string),
            last_name: user.user_metadata?.last_name || splitFullName(user.user_metadata?.full_name).lastName || (userData.last_name as string),
            avatar_url: user.user_metadata?.avatar_url || userData.avatar_url,
          },
          include: { role: true },
        }) as any;
      }
    }

    // Store in Redis cache
    await setAuthCache(token, user, userData);

    req.user = userData;
    req.supabaseUser = user;

    logger.info('auth:success', { userId: userData.id, ip: req.ip, ua: req.headers['user-agent'] });
    next();
  } catch (err) {
    logger.error('Authentication process failed', { error: err });
    next(createAppError('Authentication failed', 401));
  }
};


// ─── Optional Auth Middleware (Guests Allowed) ────────────────────────────────
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next();

  // ─── Cache Lookup ───
  const cached = await getAuthCache(token);
  if (cached) {
    req.user = cached.userData;
    req.supabaseUser = cached.user;
    return next();
  }

  let user: any = null;
  let decodedUser: any = null;
  try {
    decodedUser = jwt.verify(token, process.env.SUPABASE_JWT_SECRET as string);
    user = {
      id: decodedUser.sub,
      email: decodedUser.email,
      user_metadata: decodedUser.user_metadata || {},
    };
  } catch (err: any) {
    logger.warn(`optionalAuth: Local JWT verification failed: ${err.message}. Falling back.`);
    try {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        user = data.user;
      } else {
        return next();
      }
    } catch {
      return next();
    }
  }

  try {
    if (user) {
      const userData = await prisma.user.findUnique({
        where: { supabase_id: user.id },
        include: { role: true },
      }) as any;
      if (userData) {
        await setAuthCache(token, user, userData);
        req.user = userData;
        req.supabaseUser = user;
      }
    }
    next();
  } catch {
    // If token is invalid, we just treat them as a guest
    next();
  }

};

// ─── Role-Based Access Control ──────────────────────────────────────────────
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createAppError('Unauthorized - Login required', 401));
    }

    const userRoleName = req.user?.role?.name;

    if (!userRoleName) {
      logger.warn('Access denied: Role missing', { userId: req.user.id });
      return next(createAppError('Insufficient permissions - Role missing', 403));
    }

    if (!allowedRoles.includes(userRoleName)) {
      logger.warn('Access denied: Insufficient permissions', {
        userId: req.user.id,
        requiredRoles: allowedRoles,
        userRole: userRoleName,
      });
      return next(createAppError('Insufficient permissions', 403));
    }

    next();
  };
};

