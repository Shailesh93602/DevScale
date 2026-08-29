/**
 * Gemini client + model chain for the LLM orchestration layer (Spine A).
 *
 * The client is created LAZILY so the server boots without a key (AI Code Review
 * is an optional feature — see env.ts, which only warns in prod). `rawGenerate`
 * is the single place that touches the @google/generative-ai SDK, so tests mock
 * THIS module to exercise the orchestration (cache / breaker / fallback / schema)
 * without any network call.
 *
 * Legacy-SDK note (matches KhataGO): @google/generative-ai resolves the 2.0 / 1.5
 * families on v1beta; the 2.5 family needs the newer @google/genai SDK. Override
 * the chain with GEMINI_MODELS (CSV).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env.js';

/**
 * Whether the SERVER has a fallback key configured.
 *
 * No longer a gate on the AI features — a user with their own key can use them
 * whether or not this is true. It survives as a diagnostic (health endpoint,
 * startup warning) and as the second branch of resolveApiKey.
 */
export function isAiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY);
}

// Ordered fallback chain. Each free-tier model has its OWN daily quota bucket, so
// cascading multiplies effective quota and survives a single model's 429. Ordered
// best → most-quota → lightest.
export const MODEL_CHAIN: string[] = (
  env.GEMINI_MODELS && env.GEMINI_MODELS.length > 0
    ? env.GEMINI_MODELS
    : 'gemini-2.0-flash,gemini-2.0-flash-lite,gemini-1.5-flash,gemini-1.5-flash-8b'
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// Low temperature → deterministic, structured review output.
export const generationConfig = {
  temperature: 0.2,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 4096,
  // Force JSON so we can parse + validate the response with zod.
  responseMimeType: 'application/json',
};

/**
 * Gemini clients, one per distinct API key.
 *
 * A single shared client was correct while there was exactly one key. With
 * bring-your-own keys there are many, and the SDK binds the credential at
 * construction — so a cached singleton would send every user's request under
 * whichever key happened to construct it first. That is not a performance bug,
 * it is a billing and isolation bug, and it would be silent.
 *
 * Keyed by fingerprint rather than by the key itself so the raw credential is
 * not also sitting in a long-lived Map key. Bounded because the number of
 * distinct users is not: at the cap the oldest entry is dropped and simply
 * rebuilt on next use, which costs an object allocation and nothing else.
 */
const MAX_CACHED_CLIENTS = 200;
const clients = new Map<string, GoogleGenerativeAI>();

function clientFor(apiKey: string, fingerprint: string): GoogleGenerativeAI {
  const existing = clients.get(fingerprint);
  if (existing) return existing;

  const created = new GoogleGenerativeAI(apiKey);
  if (clients.size >= MAX_CACHED_CLIENTS) {
    // Map preserves insertion order, so the first key is the least recently
    // created. Good enough: eviction here is a memory bound, not a cache
    // strategy — a miss is free to repair.
    const oldest = clients.keys().next().value;
    if (oldest !== undefined) clients.delete(oldest);
  }
  clients.set(fingerprint, created);
  return created;
}

/**
 * Single raw call to one Gemini model, billed to `apiKey`.
 *
 * The key is a REQUIRED parameter rather than something this module reads from
 * the environment. That is deliberate: making it explicit means no call site
 * can spend the server's quota by omission, which is the exact failure the
 * BYO-key feature exists to prevent. See services/ai/resolveApiKey.ts for who
 * decides which key this is.
 *
 * Throws the SDK error verbatim so the fallback layer can classify it
 * (rate-limit vs unavailable vs real error).
 */
export async function rawGenerate(
  modelName: string,
  prompt: string,
  apiKey: string,
  fingerprint: string
): Promise<string> {
  const model = clientFor(apiKey, fingerprint).getGenerativeModel({
    model: modelName,
    generationConfig,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/** Test/diagnostics helper — drop every cached client. */
export function _resetClients(): void {
  clients.clear();
}
