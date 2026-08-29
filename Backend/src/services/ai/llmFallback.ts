/**
 * Model fallback + cooldown for the LLM layer (adapted from KhataGO's proven
 * modelFallback.ts). A rate-limited model is parked for ~60s; an unresolvable
 * model (404 on the legacy SDK) is parked for 30min so we stop paying a
 * round-trip to rediscover it. Single-shot generation (no tool side effects),
 * so cascading across models is always safe to retry.
 */

const RATE_LIMIT_COOLDOWN_MS = 60_000;
const UNAVAILABLE_COOLDOWN_MS = 30 * 60_000;

/**
 * Cooldowns, keyed by `<key fingerprint>:<model>` rather than by model alone.
 *
 * WHY THE SCOPE MATTERS, and it is not a detail.
 *
 * Quota on Gemini is per API KEY. Before bring-your-own keys there was one key,
 * so "gemini-2.0-flash is rate-limited" was a true global statement. It is now
 * false: one user hitting their personal free-tier ceiling says nothing about
 * anyone else's. A model-only key would let a single visitor's exhausted quota
 * park that model for every other user AND for the server key, for sixty
 * seconds at a time, indefinitely.
 *
 * That would make adding BYO keys a reliability REGRESSION — the feature meant
 * to isolate users would have coupled them. Scoping the map is what actually
 * delivers the isolation the feature claims.
 *
 * The 404 cooldown is arguably global (a model either resolves on this SDK or
 * does not), but it is scoped too: model availability can differ by project
 * tier, and a scoped entry costs one Map slot while a wrong global one is
 * unfalsifiable for thirty minutes.
 */
const cooldownUntil = new Map<string, number>();

/**
 * Bound the map. Entries are self-expiring by timestamp but never removed, so
 * an unbounded key space (one per user per model) would leak slowly. Cleared
 * wholesale rather than LRU-evicted: dropping a cooldown early only costs one
 * wasted request, so correctness does not depend on retention.
 */
const MAX_COOLDOWN_ENTRIES = 5_000;

function scopeKey(fingerprint: string, modelName: string): string {
  return `${fingerprint}:${modelName}`;
}

function setCooldown(key: string, until: number): void {
  if (cooldownUntil.size >= MAX_COOLDOWN_ENTRIES) cooldownUntil.clear();
  cooldownUntil.set(key, until);
}

export function isRateLimitError(err: unknown): boolean {
  const e = err as {
    status?: number;
    code?: number;
    response?: { status?: number };
    message?: string;
  };
  const status = e?.status ?? e?.code ?? e?.response?.status;
  const msg = String(e?.message ?? '').toLowerCase();
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota') ||
    msg.includes('rate limit')
  );
}

export function isModelUnavailable(err: unknown): boolean {
  const e = err as {
    status?: number;
    code?: number;
    response?: { status?: number };
    message?: string;
  };
  const status = e?.status ?? e?.code ?? e?.response?.status;
  const msg = String(e?.message ?? '').toLowerCase();
  return (
    status === 404 ||
    msg.includes('not found') ||
    msg.includes('is not supported') ||
    msg.includes('not supported for')
  );
}

/** Models not currently cooled down, in chain order. If ALL are cooled down we
 *  still return the full chain (better to try than to hard-fail). */
export function readyModels(
  chain: string[],
  now: number,
  fingerprint: string
): string[] {
  const ready = chain.filter(
    (m) => (cooldownUntil.get(scopeKey(fingerprint, m)) ?? 0) <= now
  );
  return ready.length > 0 ? ready : [...chain];
}

export function coolDownRateLimited(
  modelName: string,
  now: number,
  fingerprint: string
): void {
  setCooldown(scopeKey(fingerprint, modelName), now + RATE_LIMIT_COOLDOWN_MS);
}

export function coolDownUnavailable(
  modelName: string,
  now: number,
  fingerprint: string
): void {
  setCooldown(scopeKey(fingerprint, modelName), now + UNAVAILABLE_COOLDOWN_MS);
}

/** Test/diagnostics helper. */
export function resetCooldowns(): void {
  cooldownUntil.clear();
}
