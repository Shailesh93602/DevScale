/**
 * Model fallback + cooldown for the LLM layer (adapted from KhataGO's proven
 * modelFallback.ts). A rate-limited model is parked for ~60s; an unresolvable
 * model (404 on the legacy SDK) is parked for 30min so we stop paying a
 * round-trip to rediscover it. Single-shot generation (no tool side effects),
 * so cascading across models is always safe to retry.
 */

const RATE_LIMIT_COOLDOWN_MS = 60_000;
const UNAVAILABLE_COOLDOWN_MS = 30 * 60_000;

const cooldownUntil = new Map<string, number>();

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
export function readyModels(chain: string[], now: number): string[] {
  const ready = chain.filter((m) => (cooldownUntil.get(m) ?? 0) <= now);
  return ready.length > 0 ? ready : [...chain];
}

export function coolDownRateLimited(modelName: string, now: number): void {
  cooldownUntil.set(modelName, now + RATE_LIMIT_COOLDOWN_MS);
}

export function coolDownUnavailable(modelName: string, now: number): void {
  cooldownUntil.set(modelName, now + UNAVAILABLE_COOLDOWN_MS);
}

/** Test/diagnostics helper. */
export function resetCooldowns(): void {
  cooldownUntil.clear();
}
