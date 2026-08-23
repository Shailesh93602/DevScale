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
import {
  MODEL_CHAIN,
  isAiConfigured,
  rawGenerate,
} from './llmConfig.js';
import {
  coolDownRateLimited,
  coolDownUnavailable,
  isModelUnavailable,
  isRateLimitError,
  readyModels,
  resetCooldowns,
} from './llmFallback.js';
import { getCache, setCache } from '../cacheService.js';
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
async function generateWithFallback(prompt: string): Promise<RawResult> {
  const now = Date.now();
  const models = readyModels(MODEL_CHAIN, now);
  let lastErr: unknown;

  for (const modelName of models) {
    try {
      const text = await rawGenerate(modelName, prompt);
      return { text, model: modelName };
    } catch (err) {
      lastErr = err;
      if (isRateLimitError(err)) {
        coolDownRateLimited(modelName, Date.now());
        continue;
      }
      if (isModelUnavailable(err)) {
        coolDownUnavailable(modelName, Date.now());
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
const llmBreaker = new CircuitBreaker(generateWithFallback, {
  timeout: 20_000,
  errorThresholdPercentage: 50,
  resetTimeout: 45_000,
  volumeThreshold: 5,
  name: 'gemini-llm',
});
llmBreaker.on('open', () =>
  logger.warn('Gemini LLM circuit breaker OPEN — failing fast')
);
llmBreaker.on('halfOpen', () =>
  logger.info('Gemini LLM circuit breaker HALF-OPEN — probing')
);
llmBreaker.on('close', () =>
  logger.info('Gemini LLM circuit breaker CLOSED — recovered')
);

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
    cacheTtlSeconds = 86_400,
    cachePrefix = 'llm',
  } = options;

  if (!isAiConfigured()) {
    throw createAppError(
      'AI features are not configured (GEMINI_API_KEY missing).',
      503
    );
  }

  const cached = await getCache<T>(`${cachePrefix}:${cacheKey}`);
  if (cached) return cached;

  let raw: RawResult;
  try {
    raw = (await llmBreaker.fire(prompt)) as RawResult;
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
      raw = (await llmBreaker.fire(corrective)) as RawResult;
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
  resetCooldowns();
  llmBreaker.close();
}
