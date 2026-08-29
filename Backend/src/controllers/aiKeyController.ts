/**
 * Settings endpoints for a user's OWN Gemini API key.
 *
 * THE RULE THIS FILE OBEYS: a key goes in and never comes back out.
 *
 * There is no read path that returns the plaintext, not even to the person who
 * saved it. That is a deliberate loss of a small convenience ("show me what I
 * entered") in exchange for removing an entire class of leak — a GET that
 * returns a credential eventually ends up in a browser cache, a HAR file
 * attached to a bug report, a proxy log, or a screenshot. The masked hint
 * exists so the owner can still tell WHICH key is configured.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { catchAsync } from '../utils/index.js';
import { sendResponse } from '../utils/apiResponse.js';
import prisma from '../lib/prisma.js';
import {
  encryptSecret,
  maskSecret,
  isSecretBoxConfigured,
} from '../utils/secretBox.js';
import { GEMINI_PROVIDER } from '../services/ai/resolveApiKey.js';
import logger from '../utils/logger.js';

/**
 * Length only — no prefix or charset rule.
 *
 * Validating the SHAPE of someone else's credential is a trap: Google has
 * changed key prefixes before, and a rule that is right today rejects a valid
 * key tomorrow with a message the user cannot act on. The bounds exist to
 * refuse obvious mistakes (an empty box, a pasted essay) and to bound what we
 * encrypt, not to guess the format.
 */
const KeySchema = z.object({
  apiKey: z.string().trim().min(20).max(400),
});

export default class AiKeyController {
  /** GET /settings/ai-key — is one configured, and which one. Never the value. */
  public get = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');

    const row = await prisma.userAiKey.findUnique({
      where: {
        user_id_provider: { user_id: userId, provider: GEMINI_PROVIDER },
      },
      // key_enc is NOT selected. Not because selecting it would leak on its own
      // — it is ciphertext — but because the safest way to guarantee a response
      // never contains it is for the value never to be in the process.
      select: {
        key_hint: true,
        created_at: true,
        updated_at: true,
        last_used: true,
      },
    });

    return sendResponse(res, 'AI_KEY_FETCHED', {
      data: {
        provider: GEMINI_PROVIDER,
        configured: Boolean(row),
        hint: row?.key_hint ?? null,
        updatedAt: row?.updated_at ?? null,
        lastUsedAt: row?.last_used ?? null,
        // Tells the UI whether saving a key can work at all, so a user is not
        // invited to paste a credential into a form that will reject it.
        storageAvailable: isSecretBoxConfigured(),
      },
    });
  });

  /** PUT /settings/ai-key { apiKey } — encrypt and store (upsert). */
  public put = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');

    if (!isSecretBoxConfigured()) {
      // Fail BEFORE touching the value. Storing a key in plaintext because the
      // master key is missing is exactly the shortcut this endpoint must never
      // take, and saying so plainly beats a 500.
      logger.error(
        'SECRET_ENCRYPTION_KEY is not configured — refusing to store a user API key.'
      );
      return sendResponse(res, 'AI_KEY_STORAGE_UNAVAILABLE');
    }

    const parsed = KeySchema.safeParse(req.body);
    if (!parsed.success) {
      // The zod issue is NOT forwarded. Its `received`/`input` fields can carry
      // the submitted value, and an error path is the classic way a secret
      // reaches a log it was never meant to be in.
      return sendResponse(res, 'AI_KEY_INVALID');
    }

    const { apiKey } = parsed.data;
    const key_enc = encryptSecret(apiKey);
    const key_hint = maskSecret(apiKey);

    await prisma.userAiKey.upsert({
      where: {
        user_id_provider: { user_id: userId, provider: GEMINI_PROVIDER },
      },
      // Upsert, not create: the unique (user_id, provider) index means a second
      // save REPLACES rather than accumulating. Two rows would leave the
      // resolver picking one, which is how "it's still using my old key"
      // happens.
      create: { user_id: userId, provider: GEMINI_PROVIDER, key_enc, key_hint },
      update: { key_enc, key_hint, last_used: null },
      select: { id: true },
    });

    logger.info(
      `AI key saved for user ${userId} (provider=${GEMINI_PROVIDER})`
    );

    return sendResponse(res, 'AI_KEY_SAVED', {
      data: { provider: GEMINI_PROVIDER, configured: true, hint: key_hint },
    });
  });

  /** DELETE /settings/ai-key — remove it. Idempotent. */
  public remove = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) return sendResponse(res, 'UNAUTHORIZED');

    // deleteMany rather than delete: deleting something that is already gone
    // is the user getting what they asked for, not a 404. A "remove my key"
    // button that errors on the second click teaches people their key might
    // still be there.
    await prisma.userAiKey.deleteMany({
      where: { user_id: userId, provider: GEMINI_PROVIDER },
    });

    logger.info(
      `AI key removed for user ${userId} (provider=${GEMINI_PROVIDER})`
    );

    return sendResponse(res, 'AI_KEY_REMOVED', {
      data: { provider: GEMINI_PROVIDER, configured: false, hint: null },
    });
  });
}
