/**
 * LLM orchestration layer (Spine A).
 *
 * One reusable entry point — `generateStructured` — that wraps a Gemini call in
 * the production concerns you actually need:
 *   • Redis cache (identical input → no second spend)
 *   • opossum circuit breaker (fast-fail when the provider is degraded)
 *   • multi-model fallback + cooldown (survive a single model's 429 / 404)
 *   • JSON parse + zod schema validation, with ONE corrective retry
 *
 * The raw SDK call lives in llmConfig.rawGenerate, so tests mock that module and
 * exercise everything here without a network call.
 */

import CircuitBreaker from 'opossum';
import { z } from 'zod';
import { MODEL_CHAIN, rawGenerate } from './llmConfig.js';
import {
  coolDownRateLimited,
  coolDownUnavailable,
  isModelUnavailable,
  isRateLimitError,
  readyModels,
  resetCooldowns,
} from './llmFallback.js';
import { getCache, setCache } from '../cacheService.js';
import { requireApiKey } from './resolveApiKey.js';
import { createAppError } from '../../utils/errorHandler.js';
import logger from '../../utils/logger.js';

interface RawResult {
  text: string;
  model: string;
}

/**
 * Try each ready model in chain order. Rate-limited / unavailable models are
 * cooled down and skipped; a real error (bad request, auth) is thrown so it is
 * never masked behind fallback.
 */
interface Attempt {
  prompt: string;
  apiKey: string;
  fingerprint: string;
}

async function generateWithFallback(attempt: Attempt): Promise<RawResult> {
  const { prompt, apiKey, fingerprint } = attempt;
  const now = Date.now();
  const models = readyModels(MODEL_CHAIN, now, fingerprint);
  let lastErr: unknown;

  for (const modelName of models) {
    try {
      const text = await rawGenerate(modelName, prompt, apiKey, fingerprint);
      return { text, model: modelName };
    } catch (err) {
      lastErr = err;
      if (isRateLimitError(err)) {
        coolDownRateLimited(modelName, Date.now(), fingerprint);
        continue;
      }
      if (isModelUnavailable(err)) {
        coolDownUnavailable(modelName, Date.now(), fingerprint);
        continue;
      }
      throw err; // real error — surface it
    }
  }
  throw (
    lastErr ?? new Error('All Gemini models are rate-limited or unavailable')
  );
}

// Breaker guards provider HEALTH (timeouts / repeated failures). Fallback handles
// per-model quota WITHIN a healthy provider. Mirrors codeExecutor.ts's judge0Breaker.
//
// ONE BREAKER PER KEY, for the same reason cooldowns are scoped (see
// llmFallback.ts). A shared breaker trips on error RATE: five failures at 50%
// opens it and every subsequent caller fails fast. With bring-your-own keys the
// failures that trip it are usually attributable to ONE key — a typo'd
// credential returns 400 on every call — and a shared breaker would let that
// one user's bad key disable the feature for everybody within seconds.
//
// The breaker's job is "is the provider healthy FOR THIS CALLER", and the
// caller's identity is the key. Bounded and cleared wholesale for the same
// reason the cooldown map is: losing a breaker's state costs at most a few
// requests that fail slowly instead of fast.
const MAX_BREAKERS = 500;
const breakers = new Map<string, CircuitBreaker>();

function breakerFor(fingerprint: string): CircuitBreaker {
  const existing = breakers.get(fingerprint);
  if (existing) return existing;

  const breaker = new CircuitBreaker(generateWithFallback, {
    timeout: 20_000,
    errorThresholdPercentage: 50,
    resetTimeout: 45_000,
    volumeThreshold: 5,
    name: `gemini-llm:${fingerprint}`,
  });
  breaker.on('open', () =>
    logger.warn(
      `Gemini LLM circuit breaker OPEN (${fingerprint}) — failing fast`
    )
  );
  breaker.on('halfOpen', () =>
    logger.info(
      `Gemini LLM circuit breaker HALF-OPEN (${fingerprint}) — probing`
    )
  );
  breaker.on('close', () =>
    logger.info(
      `Gemini LLM circuit breaker CLOSED (${fingerprint}) — recovered`
    )
  );

  if (breakers.size >= MAX_BREAKERS) {
    for (const [, b] of breakers) b.shutdown();
    breakers.clear();
  }
  breakers.set(fingerprint, breaker);
  return breaker;
}

/** Strip ```json fences a model sometimes adds despite responseMimeType. */
function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
  return trimmed;
}

function tryParse<T>(
  text: string,
  schema: z.ZodType<T>
): { ok: true; value: T } | { ok: false } {
  try {
    const parsed = JSON.parse(stripCodeFences(text));
    const result = schema.safeParse(parsed);
    return result.success ? { ok: true, value: result.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

export interface GenerateStructuredOptions<T> {
  /** Stable cache key for identical inputs (provider is NOT called on a hit). */
  cacheKey: string;
  /**
   * Whose quota to spend. Omit for background jobs acting on nobody's behalf —
   * those fall through to the server key, and fail cleanly if there isn't one.
   *
   * The cache is deliberately NOT partitioned by user: an identical prompt has
   * an identical answer regardless of which key produced it, and no key
   * material is in the cached value. Partitioning it would make every user pay
   * for work already done, which is the opposite of the point. The key check
   * still happens BEFORE the cache read, so a user without a key is told to add
   * one rather than being quietly served someone else's cache hit.
   */
  userId?: string | null;
  prompt: string;
  schema: z.ZodType<T>;
  /** Cache TTL in seconds (default 24h). */
  cacheTtlSeconds?: number;
  cachePrefix?: string;
}

/**
 * Generate a schema-validated object from the LLM. Throws an AppError(503) when
 * AI is not configured or the provider is unavailable, and AppError(502) when the
 * model can't produce valid structured output even after a corrective retry.
 */
export async function generateStructured<T>(
  options: GenerateStructuredOptions<T>
): Promise<T> {
  const {
    cacheKey,
    prompt,
    schema,
    userId,
    cacheTtlSeconds = 86_400,
    cachePrefix = 'llm',
  } = options;

  // Resolve BEFORE the cache read. A user with no key must be told to add one,
  // not handed a cache hit — otherwise the feature appears to work until the
  // first cache miss, which is the worst possible moment to discover it.
  // requireApiKey throws NoApiKeyError (400) with an actionable message.
  const { apiKey, fingerprint } = await requireApiKey(userId);
  const llmBreaker = breakerFor(fingerprint);

  const cached = await getCache<T>(`${cachePrefix}:${cacheKey}`);
  if (cached) return cached;

  let raw: RawResult;
  try {
    raw = (await llmBreaker.fire({ prompt, apiKey, fingerprint })) as RawResult;
  } catch (err) {
    if (llmBreaker.opened) {
      throw createAppError(
        'AI service is temporarily unavailable — please try again shortly.',
        503
      );
    }
    throw err;
  }

  let parsed = tryParse(raw.text, schema);

  if (!parsed.ok) {
    // One corrective retry — most "almost-JSON" failures recover here.
    const corrective = `${prompt}\n\nIMPORTANT: your previous reply was not valid JSON matching the required shape. Reply with ONE valid JSON object only — no markdown, no commentary.`;
    try {
      raw = (await llmBreaker.fire({
        prompt: corrective,
        apiKey,
        fingerprint,
      })) as RawResult;
    } catch (err) {
      if (llmBreaker.opened) {
        throw createAppError(
          'AI service is temporarily unavailable — please try again shortly.',
          503
        );
      }
      throw err;
    }
    parsed = tryParse(raw.text, schema);
  }

  if (!parsed.ok) {
    logger.warn('LLM returned invalid structured output after retry');
    throw createAppError(
      'AI returned an unexpected response — please try again.',
      502
    );
  }

  await setCache(cacheKey, parsed.value, {
    ttl: cacheTtlSeconds,
    prefix: cachePrefix,
  });
  logger.info(`LLM structured generation ok (model=${raw.model})`);
  return parsed.value;
}

/** Test helper — reset breaker + cooldowns between cases. */
export function _resetLlmState(): void {
  for (const [, b] of breakers) b.shutdown();
  breakers.clear();
  resetCooldowns();
}
