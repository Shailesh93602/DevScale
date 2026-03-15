import { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { createAppError } from '../utils/errorHandler';
import logger from '../utils/logger';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// ─── Simple In-Memory Cache ───
// Caches auth results for 30 seconds to speed up concurrent requests (like dashboard load)
const authCache = new Map<string, { user: any; userData: any; expires: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

// Periodic cleanup of expired cache entries
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of authCache.entries()) {
    if (data.expires < now) authCache.delete(token);
  }
}, 60 * 1000);

export const clearAuthCache = (token: string) => {
  authCache.delete(token);
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

    // ─── Cache Lookup ───
    const cached = authCache.get(token);
    if (cached && cached.expires > Date.now()) {
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
        logger.warn('Invalid authentication attempt (Supabase Fallback)', { error });
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

    // Store in cache
    authCache.set(token, {
      user,
      userData,
      expires: Date.now() + CACHE_TTL,
    });

    req.user = userData;
    req.supabaseUser = user;
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
  const cached = authCache.get(token);
  if (cached && cached.expires > Date.now()) {
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
        // Store in cache
        authCache.set(token, {
          user,
          userData,
          expires: Date.now() + CACHE_TTL,
        });
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

