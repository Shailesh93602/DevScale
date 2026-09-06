/**
 * Every deadline this backend waits under, in one file.
 *
 * WHY THIS FILE EXISTS.
 *
 * This codebase already takes dependency failure seriously. There are three
 * circuit breakers (Judge0, per-key Gemini, Cloudinary), a Redis cache with
 * fail-open `catch` blocks on every read, a rate limiter wrapped so a Redis
 * throw is swallowed rather than 500ing the request, and retry/backoff on the
 * email queue. All of it is correct, and all of it is about a dependency that
 * FAILS.
 *
 * None of it fires when a dependency is merely SLOW, for two distinct reasons:
 *
 * 1. **A circuit breaker's `timeout` is not the dependency's timeout.**
 *    `opossum` rejects the breaker's promise at its deadline, but it has no way
 *    to cancel the work underneath — no `AbortSignal` is threaded into any of
 *    the calls it wraps. So the breaker bounds *caller latency* and does not
 *    bound *socket consumption*: at 60 s of provider slowness the caller is
 *    freed at 15–20 s while the request continues to completion. Add
 *    concurrency and you accumulate in-flight sockets the breaker believes it
 *    already gave up on.
 *
 * 2. **A `catch` block cannot catch a hang.** `getCache`, `getAuthCache` and
 *    `isTokenBlocklisted` all end in `catch { return null/false }`, and the
 *    rate limiter is wrapped with an explicit "swallow any RedisStore throw"
 *    comment. Every one of those degradations is reachable only from a
 *    *rejection*. With `maxRetriesPerRequest: null` and no `commandTimeout`, a
 *    slow-but-connected Redis produces awaits that neither resolve nor reject,
 *    so the fallbacks are dead code exactly when they are needed.
 *
 * THE RULE THIS FILE ENCODES: every call gets a transport-level timeout, and
 * where the call sits inside a breaker, that timeout is **at or below** the
 * breaker's, so the transport gives up first and the breaker never counts a
 * request it has abandoned as still running. `deadlines.test.ts` asserts those
 * inequalities rather than the numbers, so moving a breaker cannot silently
 * leave a call unbounded.
 */

/**
 * Redis command ceiling.
 *
 * Redis commands here are `GET`/`SETEX`/`EXISTS`/`EVAL` against small values —
 * sub-millisecond when healthy. 2 s is far outside normal and is chosen to be
 * survivable rather than tight: its purpose is to convert a hang into the
 * rejection the existing fail-open handlers were written for, not to police
 * latency.
 *
 * Applied ONLY to the cache/lock client. It must never be applied to the
 * Socket.io pub/sub connections, whose `subscribe` is a long-lived blocking
 * command by design, nor to Bull's own connections — Bull builds those itself
 * from `REDIS_URL` and uses blocking reads.
 */
export const REDIS_COMMAND_TIMEOUT_MS = 2_000;

/**
 * The Supabase HTTP fallback in `verifySupabaseToken`.
 *
 * Reached whenever local JWKS verification fails — including when the JWKS
 * fetch itself times out — so it sits on the auth path of every request and
 * every socket handshake. `@supabase/supabase-js` sets no timeout of its own
 * (checked: its fetch layer passes no signal), so without this the two
 * latencies simply add.
 */
export const SUPABASE_AUTH_TIMEOUT_MS = 5_000;

/**
 * The JWKS fetch. `jose` already defaults `timeoutDuration` to 5000 ms, so this
 * is not a fix — it is the same number written down where the other deadlines
 * live, so nobody has to go and read the library to know what it is.
 */
export const JWKS_TIMEOUT_MS = 5_000;

/** Judge0's breaker deadline. The transport timeouts below must stay under it. */
export const JUDGE0_BREAKER_TIMEOUT_MS = 15_000;

/** One Judge0 submission POST. */
export const JUDGE0_SUBMIT_TIMEOUT_MS = 8_000;

/**
 * One Judge0 poll GET. Ten of these run in a loop with a 1 s gap, and the whole
 * loop already sits inside the breaker — so the per-poll bound exists to stop
 * any SINGLE poll pinning a socket, not to bound the loop.
 */
export const JUDGE0_POLL_TIMEOUT_MS = 5_000;

/** The per-key Gemini breaker's deadline. */
export const LLM_BREAKER_TIMEOUT_MS = 20_000;

/** One Gemini generate. Under the breaker, so the SDK aborts before opossum gives up. */
export const LLM_CALL_TIMEOUT_MS = 15_000;

/**
 * One embedding call.
 *
 * This is the only Gemini path with NO breaker in front of it, which makes its
 * own timeout the only bound that exists. It is reached interactively by
 * `POST /tutor/ask` and in bulk by the reindex job.
 */
export const EMBEDDING_TIMEOUT_MS = 15_000;

/**
 * SMTP. These hold a Bull worker's single concurrency slot while they wait, so
 * a slow mail server stalls the whole email queue behind one message — and with
 * `attempts: 3` it does so three times.
 */
export const SMTP_CONNECTION_TIMEOUT_MS = 10_000;
export const SMTP_GREETING_TIMEOUT_MS = 10_000;
export const SMTP_SOCKET_TIMEOUT_MS = 20_000;

/** Thrown when our own budget runs out, naming the dependency that was slow. */
export class DeadlineExceededError extends Error {
  constructor(
    public readonly label: string,
    public readonly waitedMs: number
  ) {
    super(`${label} exceeded its ${waitedMs}ms deadline`);
    this.name = 'DeadlineExceededError';
  }
}

/**
 * Bound how long the caller waits for a promise.
 *
 * 🔴 `Promise.race` does NOT cancel the work — the same limitation opossum has,
 * and the reason this file exists. Use it only where the SDK offers no
 * cancellation of its own (the Gemini SDK's `requestOptions.timeout` and
 * axios's `timeout` both do, and are preferred because they abort the socket).
 * Here it is the honest best available for `supabase-js`, which exposes
 * neither.
 *
 * The timer is cleared when the work wins, so a pending timeout cannot hold the
 * process open.
 */
export async function withDeadline<T>(
  work: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new DeadlineExceededError(label, ms)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
