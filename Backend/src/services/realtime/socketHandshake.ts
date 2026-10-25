import type { ExtendedError, Socket } from 'socket.io';
import { CORS_ORIGIN } from '../../config';
import { isOriginAllowed, parseAllowedOrigins } from '../../config/corsOrigins';
import { isProduction } from '../../config/runtimeMode';
import logger from '../../utils/logger';
import { verifySupabaseToken } from '../../utils/verifySupabaseToken';
import { isBarred, syncUser } from '../../middlewares/authMiddleware';

type OriginCallback = (err: Error | null, allow?: boolean) => void;

/** Socket.io CORS: the configured list in production, local/private networks otherwise. */
export function socketCorsOrigin(
  origin: string | undefined,
  callback: OriginCallback
) {
  if (!origin) return callback(null, true);

  if (isProduction()) {
    // Same list and wildcard rules as the REST CORS check, and closed when empty.
    if (isOriginAllowed(origin, parseAllowedOrigins(CORS_ORIGIN))) {
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

/** Sent as `connect_error.data`: socket.io-client never retries a middleware refusal, so the client reads `retryable`. */
export type HandshakeErrorCode =
  | 'AUTH_TOKEN_MISSING'
  | 'AUTH_TOKEN_INVALID'
  | 'ACCOUNT_SUSPENDED'
  | 'AUTH_UNAVAILABLE';

function refusal(
  message: string,
  code: HandshakeErrorCode,
  retryable: boolean
): ExtendedError {
  const err = new Error(message) as ExtendedError;
  err.data = { code, retryable };
  return err;
}

/** Attaches our User row to `socket.data.user`, creating it via REST's `syncUser` so a first visit needs no prior API call. */
export async function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const token =
    socket.handshake.auth?.token || (socket.handshake.query?.token as string);

  if (!token) {
    return next(
      refusal('Authentication token is missing', 'AUTH_TOKEN_MISSING', true)
    );
  }

  let supabaseUser: Awaited<ReturnType<typeof verifySupabaseToken>>;
  try {
    // Verify the Supabase access token the same way the REST API does.
    supabaseUser = await verifySupabaseToken(token);
  } catch (error) {
    logger.warn('Socket token rejected', { error });
    // Retryable: the client refreshes its session before the next attempt.
    return next(
      refusal('Invalid authentication token', 'AUTH_TOKEN_INVALID', true)
    );
  }

  try {
    // Battles reference User.id, not the Supabase id.
    const dbUser = await syncUser(supabaseUser);
    // Same rule as the REST authMiddleware: a suspended account is refused.
    if (isBarred(dbUser)) {
      return next(refusal('Account suspended', 'ACCOUNT_SUSPENDED', false));
    }

    socket.data.user = {
      id: dbUser.id,
      username: dbUser.username || 'Anonymous',
      avatar_url: dbUser.avatar_url ?? undefined,
    };

    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(refusal('Authentication failed', 'AUTH_UNAVAILABLE', true));
  }
}
