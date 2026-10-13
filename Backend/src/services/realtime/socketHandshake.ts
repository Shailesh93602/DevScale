import type { ExtendedError, Socket } from 'socket.io';
import { CORS_ORIGIN } from '../../config';
import { isProduction } from '../../config/runtimeMode';
import prisma from '../../lib/prisma';
import logger from '../../utils/logger';
import { verifySupabaseToken } from '../../utils/verifySupabaseToken';

type OriginCallback = (err: Error | null, allow?: boolean) => void;

/** Socket.io CORS: the configured list in production, local/private networks otherwise. */
export function socketCorsOrigin(
  origin: string | undefined,
  callback: OriginCallback
) {
  if (!origin) return callback(null, true);

  if (isProduction()) {
    const allowedOrigins = (CORS_ORIGIN || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }

  // Development: allow localhost + private network
  const isAllowed =
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
    /^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(
      origin
    );
  callback(isAllowed ? null : new Error('Origin not allowed'), isAllowed);
}

/** Authentication middleware: attaches our own User record to `socket.data.user`. */
export async function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token =
      socket.handshake.auth.token || (socket.handshake.query.token as string);

    if (!token) {
      return next(new Error('Authentication token is missing'));
    }

    // Verify the Supabase access token the same way the REST API does, then
    // resolve the internal user (battles reference User.id, not the Supabase id).
    const supabaseUser = await verifySupabaseToken(token);
    const dbUser = await prisma.user.findUnique({
      where: { supabase_id: supabaseUser.id },
      select: { id: true, username: true, avatar_url: true },
    });
    if (!dbUser) {
      return next(new Error('Invalid authentication token'));
    }

    socket.data.user = {
      id: dbUser.id,
      username: dbUser.username || 'Anonymous',
      avatar_url: dbUser.avatar_url ?? undefined,
    };

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
}
