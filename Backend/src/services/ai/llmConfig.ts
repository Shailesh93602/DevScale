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

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set — AI features are disabled.');
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return client;
}

/**
 * Single raw call to one Gemini model. Returns the model's text (expected JSON).
 * Throws the SDK error verbatim so the fallback layer can classify it
 * (rate-limit vs unavailable vs real error).
 */
export async function rawGenerate(
  modelName: string,
  prompt: string
): Promise<string> {
  const model = getClient().getGenerativeModel({
    model: modelName,
    generationConfig,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
