import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { createAppError } from './errorHandler.js';
import logger from './logger.js';

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
export const verifySupabaseToken = async (
  token: string
): Promise<SupabaseUser> => {
  try {
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const JWKS_INTERNAL = createRemoteJWKSet(
      new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
    );
    const { payload } = await jwtVerify(token, JWKS_INTERNAL);

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
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      throw createAppError('Invalid authentication token', 401);
    }
    return data.user;
  }
};
