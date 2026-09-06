# Slow dependencies — what is bounded, and what is not yet

A dependency that **fails** is handled here: three circuit breakers, fail-open cache reads, retry and
backoff on the email queue, a rate limiter wrapped to swallow Redis throws. A dependency that is
merely **slow** was not, because every one of those paths is entered by a rejection arriving, and
nothing arrives when a socket is open and quiet. `FINDINGS.md` #13 has the full account.

This file is the standing reference: the rule, what is bounded today, what is deliberately still
open, and how to add a new dependency without reintroducing the problem.

---

## The rule

> **Every outbound call gets a transport-level timeout. Where the call sits inside a circuit
> breaker, that timeout is at or below the breaker's.**

The second half is the part that is easy to miss. `opossum` rejects the breaker's promise at its
deadline but **cannot cancel the work underneath** — it threads no `AbortSignal` into what it wraps.
So a breaker bounds *caller latency* and not *socket consumption*. If a call's own timeout is larger
than its breaker's, the breaker gives up while the request keeps running, and under concurrency the
process accumulates in-flight sockets it believes it already abandoned.

Every budget lives in `Backend/src/utils/deadlines.ts`, and
`Backend/src/tests/services/slowDependency.test.ts` asserts the *inequalities* rather than the
numbers — so moving a breaker's timeout fails a test instead of quietly leaving a call unbounded.

---

## Bounded today

| Call | Bound | Note |
| --- | --- | --- |
| Redis cache / lock client | `commandTimeout: 2 s` | The one change that makes four existing fail-open handlers reachable. |
| `supabase.auth.getUser` | 5 s (`withDeadline`) | The SDK exposes no timeout, so a race is the honest best available. |
| JWKS fetch | 5 s (`jose` `timeoutDuration`) | Was already bounded by the library default; now stated explicitly and the key set is cached. |
| Judge0 submit / poll | 8 s / 5 s (axios) | Both under the 15 s breaker. |
| Gemini generate | 15 s (SDK `requestOptions`) | Under the 20 s per-key breaker. |
| Gemini embedding | 15 s (SDK `requestOptions`) | **No breaker at all** — this is its only bound. |
| SMTP | 10 s connect / 10 s greeting / 20 s socket | Holds a Bull worker's concurrency slot while it waits. |

**Deliberately not given a `commandTimeout`:** the Socket.io pub/sub connections
(`services/socket.ts`) and Bull's own connections. Both use long-lived blocking commands by design —
`subscribe` and blocking reads — and a command timeout there would break them. They are constructed
separately from the cache client, which is what makes bounding the cache client safe.

---

## Not fixed — design changes, not timeouts

Each of these needs a decision, not a number. They are listed with what is actually wrong so the
decision can be made from evidence rather than rediscovered.

### 1. `judge0Breaker` is shared, behind an unbounded per-user fan-out

`utils/codeExecutor.ts` exports a module-level singleton breaker
(`volumeThreshold: 3`, `errorThresholdPercentage: 50`). Two call sites fan out over a test-case array
whose length comes from the database, with no concurrency cap:

- `controllers/codeController.ts` — `Promise.all` over the public test cases
- `repositories/challengeRepository.ts` — `Promise.all` over **all** of them, hidden included

One user running one challenge with ten test cases against a slow Judge0 makes ten concurrent breaker
calls, all of which trip the timeout — instantly past the volume threshold at 100% failure. The
breaker opens **for every user** for 30 seconds.

**The fix is already written in this repository, one directory away.** `services/ai/llmService.ts`
keys its breaker per API-key fingerprint, with the reasoning spelled out: a shared breaker would let
one user's bad key disable the feature for everybody. Judge0 wants the same treatment (keyed per
user), plus a concurrency bound on the fan-out so one submission cannot issue N simultaneous calls.

*Not done here because* changing breaker identity changes the failure semantics of code execution for
every user, and that deserves its own change with its own test for the "one user's failures do not
open another user's breaker" property.

### 2. `getWithLock` recursion amplifies load on an already-slow dependency

`services/cacheService.ts`:

```ts
const acquired = await redis.set(lockKey, '1', 'EX', lockTtl, 'NX');   // lockTtl = 5
if (!acquired) {
  await new Promise((r) => setTimeout(r, 100));
  return getWithLock(key, callback, options);   // unbounded recursion
}
const fresh = await callback();                  // arbitrary, unbounded work
```

Two problems, both only visible under slowness. The lock TTL is 5 s while `callback()` is unbounded,
so a slow callback means the lock **expires while its holder is still running** and several callers
believe they hold it. And a waiter retries by recursing every 100 ms with no attempt cap — so a slow
callback produces a growing stack per waiter and a 100 ms polling storm from every one of them,
against the dependency that is already struggling.

**The fix** is a bounded retry loop (not recursion) with a cap and jittered backoff, and a lock TTL
derived from the callback's own deadline rather than a constant — the same "derive the budget from
what it protects" shape used in the sibling repo's claim protocol. *Not done here* because it changes
the concurrency behaviour of every cached read.

### 3. `transactionManager` retries on top of transactions that are still running

`utils/transactionManager.ts` races `prisma.$transaction(callback)` against a timer:

```ts
Promise.race([
  prisma.$transaction(callback),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction timeout')), timeout)),  // 5000
]);
```

`Promise.race` rejects the caller. It does **not** roll the transaction back or cancel it — the
transaction keeps running and keeps holding its row locks. The surrounding `while (attempt <
maxRetries)` (3) then starts a second and a third transaction on top of the first two. A slow database
is thereby turned into **triple** the lock pressure, by the code written to protect it.

**The fix** is Postgres's own `statement_timeout` / Prisma's `$transaction` `timeout` option, which
abort the transaction server-side rather than abandoning it client-side. *Not done here* because it
needs the callers (`services/content/versionControl.ts`) re-verified against real transaction
semantics on a live pg17, not a mock.

### 4. Frontend: `getUser()` in edge middleware

`Frontend/src/utils/supabase/middleware.ts` calls `supabase.auth.getUser()` with no timeout, in
middleware matching nearly every route. The code comments already name the failure
(`MIDDLEWARE_INVOCATION_TIMEOUT` when the Supabase project is cold or free-tier paused) and the
mitigation applied was to *reduce how often* the call happens, not to bound it. Edge middleware has
far tighter duration limits than functions, so this fails first and hardest — as a 500 on the route
rather than a degraded render.

*Not done here* because the backend and frontend are separate deploy units and this change wants its
own verification against a real cold Supabase project.

---

## Adding a new dependency

1. Put its budget in `Backend/src/utils/deadlines.ts` with a sentence saying what it bounds and why
   that number. Not inline at the call site.
2. Prefer the SDK's own timeout (axios `timeout`, the Gemini SDK's `requestOptions.timeout`,
   `AbortSignal`) — those **cancel**. `withDeadline` only stops the caller waiting; use it when the
   library offers nothing better, and say so in a comment.
3. If it goes behind a breaker, add the inequality to `slowDependency.test.ts`.
4. Test it with a dependency that **never answers**, not one that throws. A test that injects an
   error exercises a path that already worked.
