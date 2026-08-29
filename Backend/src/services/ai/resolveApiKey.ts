/**
 * Decide WHOSE Gemini quota a given AI request spends.
 *
 * This is the only module in the codebase that decrypts a user's key, and the
 * only one that reads `UserAiKey.key_enc`. Keeping that surface to one file is
 * the whole security design: an audit of "where can a user's credential be
 * read" is a search for one import, not a review of every AI feature.
 *
 * THE ORDER, AND WHY.
 *
 *   1. The user's own key, if they have saved one.
 *   2. The server's GEMINI_API_KEY, if one is configured.
 *   3. Nothing — the caller must tell the user to add a key.
 *
 * The server key is LAST because the point of this feature is that a visitor
 * evaluating the project should not silently spend the owner's free-tier quota
 * (the request that prompted it: "why should we waste our token there for their
 * testing?"). In production GEMINI_API_KEY is expected to be absent, which
 * makes step 3 the normal path for a user who has not configured anything —
 * they get an explicit, actionable message instead of a quota error later.
 *
 * A DECRYPTION FAILURE DOES NOT FALL THROUGH TO THE SERVER KEY.
 *
 * If a row exists but will not decrypt, something is wrong — a rotated master
 * key, or tampering. Quietly billing the server instead would hide that
 * forever and hand the user a working feature that is not using the key they
 * configured. It returns `none` and logs, so the failure is visible and the
 * user is told to re-enter their key.
 */

import prisma from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import {
  decryptSecret,
  keyFingerprint,
  SecretEncryptionError,
} from '../../utils/secretBox.js';
import logger from '../../utils/logger.js';

export const GEMINI_PROVIDER = 'gemini';

export type KeySource = 'user' | 'server' | 'none';

export interface ResolvedKey {
  kind: KeySource;
  /** Present only when kind !== 'none'. */
  apiKey?: string;
  /**
   * A short non-reversible id for whichever key was chosen, used to partition
   * per-key runtime state. `'server'` for the server key so its cooldowns and
   * breaker are shared, which is correct — it IS one key.
   */
  fingerprint?: string;
}

/**
 * The message shown to a user who has no key configured.
 *
 * Written as a next step rather than a diagnosis: it names the exact page and
 * the exact thing to paste. "AI is not configured" tells someone that a
 * problem exists and nothing about what to do with it.
 */
export const NO_KEY_MESSAGE =
  'Add your own Google Gemini API key in Settings to use the AI features. ' +
  'It stays encrypted and is only ever used for your own requests.';

/**
 * `statusCode`, not `status` — middlewares/errorHandler.ts branches on
 * `typeof err.statusCode === 'number'` and anything else falls through to a
 * generic 500 whose message is replaced with "Internal server error" in
 * production. The carefully written NO_KEY_MESSAGE would never have reached
 * the user, and the one thing this error exists to do is tell them what to do.
 *
 * 400, not 503: the request is well-formed but the CALLER has not supplied
 * something only they can supply. 503 would say the service is at fault and
 * invite a retry that cannot succeed.
 */
export class NoApiKeyError extends Error {
  statusCode = 400 as const;
  /** Machine-readable so the client can link straight to the settings page. */
  details = { code: 'AI_KEY_REQUIRED' as const };
  constructor(message: string = NO_KEY_MESSAGE) {
    super(message);
    this.name = 'NoApiKeyError';
  }
}

/**
 * Resolve the key for a request.
 *
 * `userId` is optional so background jobs (content ingest, embedding backfill)
 * can call the same resolver and get the server key — they act on behalf of
 * nobody, so there is no user key to prefer.
 */
export async function resolveApiKey(
  userId?: string | null
): Promise<ResolvedKey> {
  if (userId) {
    const row = await prisma.userAiKey.findUnique({
      where: {
        user_id_provider: { user_id: userId, provider: GEMINI_PROVIDER },
      },
      select: { key_enc: true },
    });

    if (row) {
      try {
        const apiKey = decryptSecret(row.key_enc);
        // Fire-and-forget: a failed last_used stamp must never fail the AI
        // request the user actually asked for.
        void prisma.userAiKey
          .update({
            where: {
              user_id_provider: { user_id: userId, provider: GEMINI_PROVIDER },
            },
            data: { last_used: new Date() },
          })
          .catch(() => undefined);

        return { kind: 'user', apiKey, fingerprint: keyFingerprint(apiKey) };
      } catch (err) {
        // Log the FACT, never the ciphertext and never the user's key. The
        // user id is enough to act on.
        logger.error(
          `Stored AI key for user ${userId} could not be decrypted (${
            err instanceof SecretEncryptionError ? err.name : 'unknown error'
          }) — treating the user as having no key.`
        );
        return { kind: 'none' };
      }
    }
  }

  if (env.GEMINI_API_KEY) {
    return {
      kind: 'server',
      apiKey: env.GEMINI_API_KEY,
      fingerprint: 'server',
    };
  }

  return { kind: 'none' };
}

/** Resolve, or throw the user-facing "add a key" error. */
export async function requireApiKey(
  userId?: string | null
): Promise<{ apiKey: string; fingerprint: string; kind: KeySource }> {
  const resolved = await resolveApiKey(userId);
  if (resolved.kind === 'none' || !resolved.apiKey || !resolved.fingerprint) {
    throw new NoApiKeyError();
  }
  return {
    apiKey: resolved.apiKey,
    fingerprint: resolved.fingerprint,
    kind: resolved.kind,
  };
}
