import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { createAppError } from './errorHandler.js';
import logger from './logger.js';
import {
  JWKS_TIMEOUT_MS,
  SUPABASE_AUTH_TIMEOUT_MS,
  withDeadline,
} from './deadlines.js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
);

/**
 * Verify a Supabase-issued access token and return the Supabase user.
 *
 * Tries fast local verification against Supabase's published JWKS first, then
 * falls back to the Supabase HTTP API. This is the single source of truth for
 * token verification — both the HTTP auth middleware and the WebSocket auth
 * handshake use it, so a token that's valid for the REST API is also valid for
 * the realtime layer (they previously diverged: the socket checked tokens
 * against a local HMAC secret and rejected every real Supabase token).
 */
/**
 * The JWKS, built ONCE.
 *
 * It used to be constructed inside the function, which threw away the key set
 * on every call — `createRemoteJWKSet` caches for `cacheMaxAge` (10 min by
 * default) and cools down for 30 s between refetches, and a fresh instance per
 * call has neither. Every authenticated request on a cache miss therefore made
 * its own network round trip to Supabase for a document that changes about
 * never. Hoisting it is what makes that cache real.
 *
 * `timeoutDuration` is passed explicitly even though 5000 ms is already jose's
 * default: this is the auth path for every request and every socket handshake,
 * and a deadline that important should not be an invisible library default that
 * a version bump could change.
 */
let jwks: Awaited<ReturnType<typeof loadJwks>> | undefined;

async function loadJwks() {
  const { jwtVerify, createRemoteJWKSet } = await import('jose');
  return {
    jwtVerify,
    keySet: createRemoteJWKSet(
      new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`),
      { timeoutDuration: JWKS_TIMEOUT_MS }
    ),
  };
}

export const verifySupabaseToken = async (
  token: string
): Promise<SupabaseUser> => {
  try {
    jwks ??= await loadJwks();
    const { payload } = await jwks.jwtVerify(token, jwks.keySet);

    return {
      id: payload.sub,
      email: payload.email as string,
      user_metadata: (payload.user_metadata as Record<string, unknown>) || {},
    } as unknown as SupabaseUser;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logger.warn(
      `Local JWT verification failed: ${errorMessage}. Falling back to Supabase HTTP API.`
    );
    // 🔴 Bounded, and this is the one that mattered. `@supabase/supabase-js`
    // passes no signal to its fetch, so this call had no deadline — and it is
    // reached precisely WHEN the JWKS path was slow, so an auth request could
    // spend 5 s timing out against the key set and then wait indefinitely here.
    // It sits in front of every authenticated route and the socket handshake.
    const { data, error } = await withDeadline(
      supabase.auth.getUser(token),
      SUPABASE_AUTH_TIMEOUT_MS,
      'supabase auth.getUser'
    );
    if (error || !data?.user) {
      throw createAppError('Invalid authentication token', 401);
    }
    return data.user;
  }
};
