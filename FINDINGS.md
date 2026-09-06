# Findings

Real defects found in this codebase, and how each was found.

Some of these were mine — introduced in this same round of work and caught before or shortly after
merging. Those are kept in deliberately. **A findings document that only contains other people's
mistakes is a marketing document.**

---

## 1. The test suite wrote to production

`battle.test.ts` calls `prisma.user.create`, `battle.deleteMany` and `user.deleteMany`. `Backend/.env`
points `DATABASE_URL` at the live Supabase instance.

**So `npm test` created and deleted rows in the production database.**

Nothing was harmed. Jest runs `afterAll` even when tests fail, so fixtures were always cleaned up, and
a read-only sweep for leftover `test-supabase-*` users and `Test Topic *` rows found **zero orphans**.

But that is the _teardown being careful_, not anything preventing the connection. A killed process, a
crash between create and delete, or a `where` clause widened by a refactor all end the same way — and
they end there silently.

**Fix:** two checks, because one is not enough. The URL string must name a local throwaway, _and_ the
live connection is asked which database it actually opened. The second exists because the first
validates a string and cannot know where the client went.

> **The lesson:** the sibling repo has the identical trap in a different form — running
> `DATABASE_URL=…/local npx prisma migrate deploy` there connects to **production**, because the
> Prisma CLI loads the repo's `.env` in preference to the shell. It announces
> _"Environment variables loaded from .env"_ and then does something else entirely.
>
> **Validate the string, then ask the connection what it is.** Any tool that can silently substitute
> configuration defeats a pre-flight check on a string.

---

## 2. My own safety guard had a hole that matched production

Writing the guard above, I allow-listed the database name `postgres`, because that is the default for
a Postgres service container in CI.

**Production Supabase's database is also named `postgres`.**

So the name check would have waved production straight through. Only the host check stood between the
suite and the live database — the very redundancy I had just argued was necessary, doing the entire
job on its own.

> **The lesson:** an allow-list whose most permissive entry matches the thing you are guarding against
> is not an allow-list. Fixed by naming the CI database `eduscale_test` so no default ever needs to be
> accepted, and there is now a test asserting `postgres` is refused _even on localhost_.

---

## 3. And then the guard refused a legitimate connection

The same guard required `inet_server_addr()` to be loopback. A Docker service container is reached at
`localhost` from the runner but reports its **own private address** (`172.18.0.2`) from inside, so CI
failed with:

```
REFUSING TO RUN: connected to non-local host 172.18.0.2/32
```

Failing closed is the right direction to be wrong. But this is a false positive, and containers,
pgbouncer, proxies and tunnels all legitimately report a non-loopback address.

> **The lesson: a guard that cries wolf gets deleted.** The connection-level check now asserts the
> database _name_; the URL check already covers the host. Choosing the signal that is actually
> discriminating matters more than adding another check.

---

## 4. 143 tests that had no bearing on anything

The pipeline was audit + lint + typecheck + build. **No test job, in either package.** So 143 backend
tests and 5 frontend tests existed, passed locally, and could not block a merge. A change could break
every assertion in the repo and still go green.

Worse than the security audit that was failing on every PR since June — at least that was _visibly_
red. These were invisible.

**And it earned its keep on the first run.** With a test job wired up, `rbac.test.ts` immediately
failed in CI with `supabaseUrl is required` — it had been reading config from a local `.env` that CI
does not have. **My claim that those tests were hermetic was true only on the machine that happened
to have the configuration.**

> **The lesson:** "it passes locally" is a statement about your machine.

---

## 5. "Flaky" was a misdiagnosis

`battle.test.ts` was excluded from CI as flaky and slow — 220 seconds of a ~230 second run, failing
intermittently. Three local runs with no code change: fail, fail, pass.

Both symptoms had **one cause**: every query was a network round-trip to remote Supabase. Against a
local database **the same 34 tests pass in seconds.**

> **The lesson:** excluding it would have been treating a symptom. Wiring a genuinely flaky suite into
> a required check trains people to re-run CI until it goes green, which destroys the value of every
> other check in the file — so the instinct to exclude was right, and the diagnosis behind it was
> wrong.

---

## 6. An idempotency guard that was not one

The AI code-review endpoint was documented as idempotent: _"a second call returns the stored review."_

```ts
findAiReviewBySubmission(submissionId)   // findFirst — nothing unique behind it
createAiReview({ ... })                  // plain create
```

The schema had `@@index([submission_id])` — a plain index, **not unique**. True sequentially, false
under concurrency: two concurrent requests both miss the read, **both call Gemini**, and both insert.

Each duplicate is a real paid LLM call on a project with ~zero free quota, and the trigger is a
double-click on a slow button.

**The tell was already in the code:** `orderBy: { created_at: 'desc' }` in the finder. Ordering only
matters if more than one row can exist — the code _anticipated_ duplicates and coped with them
instead of preventing them.

Fixed by making the constraint the guarantee and the read a fast path. Then fixed again: the claim now
happens **before** the LLM call, so the loser of a race no longer pays for a generation it discards —
with release-on-failure, and stale-claim takeover whose predicate lives inside the mutation.

---

## 7. Four migrations that production did not have

Nothing applied migrations on deploy. The build was `tsc && tsc-alias`, with `prisma generate` in
postinstall — and `generate` rebuilds the _client_, never the database.

A read-only `prisma migrate status` found **four unapplied**, every one backing already-merged code.

**Why it had not blown up, and why that is not reassuring:** the AI paths are inert because
`GEMINI_API_KEY` is unset. The missing key was masking the missing schema. But rating and matchmaking
need no LLM at all, and `UserRating` does not exist in production — those endpoints fail whenever
called.

> It also means setting that API key would not switch the AI features on. It would switch them on
> against a database with no `ContentEmbedding` table.

---

## 8. A websocket DoS in a websocket app

`npm audit` reported 216 vulnerabilities, 49 critical — a number large enough to be ignored, which is
what had happened.

Audited with `--omit=dev`, what actually **ships** was 43: 15 high, 1 critical. Three of the highs
were:

```
ws                memory exhaustion DoS from tiny fragments and data chunks
socket.io-parser  zero-attachment memory exhaustion
engine.io         inherited from ws
```

A remote memory-exhaustion DoS in the socket layer of a realtime battle application is not a
background advisory — **it is the attack surface the product is built on.**

Now 0 high and 0 critical in production dependencies, and the CI audit gates on `--omit=dev` so it
means something instead of being permanently red.

> **The lesson:** the headline number was noise dominated by dev tooling that never runs in
> production. The number that mattered was 30× smaller and 100× more actionable.

---

## What these have in common

Three of the eight were **mine**, introduced while fixing the others. That is the honest shape of this
kind of work: a guard with a hole that matched production, and then the same guard refusing a
legitimate connection, are both mistakes made _while being careful_.

The rest share a pattern — each was **correct under the conditions it was tested in**:

- an idempotency check that holds sequentially and fails concurrently
- a suite that is hermetic on a machine that has the config
- a test that is flaky over a network and instant against a local database
- a build step that handles the client and looks like it handles the database

---

## 9. The contract test was exhaustive within four routers and blind to twenty

`adminRouteContract.test.ts` exists to prove every admin route is authenticated and role-gated. It
is a genuinely good test: it introspects the **real Express router** rather than a hand-maintained
list, and its own doc-comment explains why —

> Asserting against a hand-maintained list of "routes that should be protected" would pass happily
> while the real router disagreed.

It was right about that, and it was doing exactly what it claimed. But the list of **routers** was
four imports at the top of the file. The routes within those four were enumerated from reality; the
choice of which four was a hand-maintained list.

What was sitting in the other twenty:

```ts
// Protected routes
this.router.post("/", this.mainConceptController.createMainConcept);
this.router.put("/:id", this.mainConceptController.updateMainConcept);
this.router.delete("/:id", this.mainConceptController.deleteMainConcept);
```

No middleware of any kind. **`DELETE /api/v1/main-concepts/:id` was unauthenticated curriculum
deletion**, reachable by anyone who could reach the internet, under a comment asserting the
opposite. Alongside it: `POST /resources/delete-subjects` running `deleteMany` over caller-supplied
ids behind authentication only — any signed-in student could wipe the curriculum — and
`PATCH /support/tickets/:ticketId/status` with its permission check commented out, over a repository
that updates by id with no ownership filter and assigns the ticket to the caller.

**Fix:** the suite now enumerates route files from the filesystem, so a router added next month is
covered the day it lands rather than the day somebody remembers the import. Verified to have teeth by
removing a guard and watching it fail by route name.

> **The lesson:** "we have a test for that" has a scope, and the scope is usually invisible. This
> test's blind spot was not its assertions — those were strict — but its **input set**, which is the
> one part of a test nobody re-reads. When a check is exhaustive, ask _over what_.

---

## 10. Two guards that failed open, in opposite directions

Found while hardening the admin surface. Neither would appear in a test run, because both behave
correctly until the moment they are needed.

**CORS.** In production the origin check ended:

```ts
if (allowedOrigins.length === 0 || isAllowed) return callback(null, true);
```

An unset or empty `CORS_ORIGIN` therefore meant _allow every origin_ — with `credentials: true`,
which is the combination that lets another site read authenticated responses. A **missing
environment variable silently widened access.** It now fails closed and logs.

**The rate limiter.** Its Redis error handler set `redisClient = null`, permanently, for the life of
the process. The limiter treats a null client as "let the request through", so **one transient Redis
error silently disabled every rate limiter and the account lockout** until the next deploy — with no
log line saying so. ioredis reconnects on its own, so the handle is now kept; the fail-open path
stays (a limiter outage must not take the API down) but every bypass is logged.

> **The lesson:** the interesting question about a guard is not "does it block the bad thing" but
> "what does it do when its own dependency is missing". Both of these answered _"allow everything,
> quietly"_, and both answers were one line long.

---

## 11. A controller that could not be loaded by any test

Adding the filesystem-enumerating suite above produced a failure with an empty message. Made
diagnostic, it read:

```
resourceController.ts: failed to load — TS2823: Import attributes are only supported
when the '--module' option is set to 'esnext', 'node18', 'nodenext', or 'preserve'.
```

The app builds with `module: ESNext`, where `import data from './x.json' with { type: 'json' }` is
correct. `tsconfig.jest.json` overrides `module` to `CommonJS`. So the file compiled and shipped
fine, and **could not be imported by a single test** — that controller, and everything importing it,
was untestable. Nothing failed, because nothing ran.

**Fix:** that one diagnostic is ignored in the test transform only; the attribute is erased by the
CommonJS emit anyway, so no behaviour and no production output changes.

> **The lesson:** a file with no tests looks exactly like a file whose tests cannot load it. The
> first is a gap you can see in a coverage report; the second reports zero and gets read as "nobody
> got to it yet". Check that the untested thing is _testable_ before believing the number.

---

## 12. The audit that found nothing, and the two things it found anyway

The sibling repo, KhataGO, lost seven days of production deploys to a migration that created six
indexes with bare `CREATE INDEX`. Three already existed, put there by migrations that live in
production's `_prisma_migrations` and not in that repository. `42P07`, transaction rolled back,
Prisma recorded the migration failed, and every later build died at `prisma migrate deploy` with
`P3009` before compiling anything.

EduScale runs migrations on every production deploy too (`Backend/scripts/vercel-build.sh`), so it
was checked for the same shape. **It is clean, and the checking is the finding.**

Read-only, against production, 2026-09-06: `_prisma_migrations` holds exactly the fifteen migrations
in this repo — no unaccounted rows, none with `finished_at IS NULL`, none rolled back — and all
fifteen recorded checksums equal the sha256 of the files on disk. Replaying the chain onto an empty
PostgreSQL 17 produced an object set **identical** to production's `public` schema: 356 indexes, 126
tables, 1001 columns with the same types, defaults and nullability, 285 constraints, empty diff in
both directions. There was nothing to fix.

**The first thing that turned up anyway.** Two migrations —
`20260615000000_drop_quizquestion_system_b` and `20260615010000_enums_to_text` — carry
`applied_steps_count = 0` with `started_at = finished_at`. That is the signature of
`migrate resolve --applied`: their SQL never ran through Prisma. Their effects *are* in production
(the four System-B tables are gone, zero enum types remain), so nothing is wrong — and that is
precisely the point. It is written proof that DDL reaches this database by routes the repository does
not record, which is the exact precondition KhataGO had. Being clean today is a fact with a date on
it, not a property of the code.

**The second is what `migrate status` says while wedged.** Reproduced on this repo's own chain: an
out-of-band index, then a bare `CREATE INDEX` over it, gave `42P07` → `P3018`, and `P3009` on the
next deploy with a later migration stranded behind it. `prisma migrate status` then printed

```
Following migration have not yet been applied:
20260906020000_queued_behind
To apply migrations in production run prisma migrate deploy.
```

It never named the failed migration and never used the word "failed". The wedge reads as one ordinary
pending migration — and `migrate deploy` will never apply it. The diagnostic that works is the row
itself: `finished_at IS NULL AND rolled_back_at IS NULL`.

**Fixed forward, since there was nothing to fix backward.**
`Backend/src/tests/migrations/migrationIdempotency.test.ts` fails any migration that creates an index,
table, extension or column without `IF NOT EXISTS`, or a type or constraint without a
`DROP … IF EXISTS` / `DO $$ … EXCEPTION WHEN duplicate_object` guard. The eleven already-applied
migrations are **ratcheted** by offender count rather than exempted — 501 in the baseline alone —
so they may only get better, and a twelfth entry is a visible act in review. A second test pins every
migration's sha256 to the checksum production recorded, because editing an applied file is the P3006
half of the same outage and there is no fix for it in the repo. `docs/MIGRATIONS.md` carries the
recovery procedure, rehearsed end to end on a scratch database.

> **The lesson:** an audit that finds no defect has still measured something, and what it measured
> has a shelf life. "Production and the repository agree" is true on a date; "the repository is a
> complete description of production" never was — and two `resolve --applied` rows say so in this
> database's own bookkeeping. The useful output of a clean audit is not the all-clear. It is the
> guard that makes the all-clear survive the next migration.

---

## 13. Three circuit breakers, and not one of them bounds a request

This codebase takes dependency failure seriously, and the evidence is everywhere: a Judge0 circuit
breaker, a **per-key** Gemini breaker (with a written argument for why a shared one would let one
user's bad key disable the feature for everybody), a Cloudinary breaker, fail-open `catch` blocks on
every cache read, retry with exponential backoff on the email queue, and a rate limiter wrapped with
the comment *"Wrap so any RedisStore throw gets swallowed and the request continues."*

Every one of those is entered by a **rejection**. Two separate mechanisms mean none of them fires
when a dependency is slow.

### A breaker's `timeout` is not the request's timeout

`opossum` rejects the breaker's promise at its deadline. It cannot cancel the work underneath —
no `AbortSignal` is threaded into any call any of the three breakers wrap. So a breaker bounds
**caller latency** and not **socket consumption**: at 60 s of provider slowness the caller is freed
at 15–20 s while the request runs to completion.

That is not merely wasteful, because the fan-out in front of Judge0 is unbounded:

```ts
const executionPromises = testCasesToRun.map(async (tc) => { … await executeCode({…}) … });
return await Promise.all(executionPromises);
```

`judge0Breaker` is a module-level singleton with `volumeThreshold: 3` and
`errorThresholdPercentage: 50`. One user submitting one challenge with ten test cases against a slow
Judge0 makes ten concurrent breaker calls, every one of which trips the 15 s timeout — instantly past
the volume threshold at 100% failure. **The breaker opens for everybody** and returns 503 for the next
30 seconds, while ten sockets that nothing is waiting for stay open. One user's one slow submission
takes code execution down platform-wide.

The irony is sharp: the *same repository* already reasoned this out correctly one directory away, in
`llmService.ts`, and made the Gemini breaker per-key for exactly this reason. The reasoning simply
was not carried across to Judge0.

### A `catch` cannot catch a hang

```ts
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required for Redlock and Bull
  …
});
```

`maxRetriesPerRequest: null` means *retry forever*, and no `commandTimeout` was set. Against a Redis
that is **slow but connected**, a command therefore neither resolves nor rejects. Measured against a
local server that completes the Redis handshake and then goes silent:

```
no commandTimeout (today)   : STILL PENDING after 4s
commandTimeout: 2000 (fix)  : rejected in 2001ms: Command timed out
```

Four separate fail-open handlers are built on that client, and **all four are unreachable** in the
case they exist for — `getCache`'s catch, `getAuthCache`'s catch, `isTokenBlocklisted`'s catch, and
the rate limiter's swallow-wrapper. The worst is the last one, because it runs *before routing*:
requests pile up inside the rate-limit middleware having never reached a handler. The comment
promising graceful degradation is precisely calibrated to a Redis that is **down**, and offers
nothing for one that is slow.

The comment was also wrong about why the option was there. Bull does not use this client at all — it
builds its own connections from `REDIS_URL` (`new Queue(name, REDIS_URL)`). Only Redlock needs
`maxRetriesPerRequest: null`, which is what makes a command timeout safe to add here. The two genuine
long-lived-command clients — Socket.io's pub/sub pair and Bull's own — are constructed elsewhere and
are deliberately untouched.

### The widest one: auth

`verifySupabaseToken` sits in front of every authenticated route *and* the socket handshake. It built
`createRemoteJWKSet` **inside** the function, discarding on every call the 10-minute key-set cache
that `jose` implements — so each auth made its own network round trip for a document that changes
about never. The JWKS fetch itself turned out to be bounded (`jose` defaults `timeoutDuration` to
5000 ms — a candidate defect **dismissed on the library's source**), but the HTTP fallback beneath it
was not: `supabase.auth.getUser(token)` has no timeout, `@supabase/supabase-js` sets none, and it is
reached *precisely when* the JWKS path is slow. A request could spend 5 s timing out against the key
set and then wait forever underneath it.

**Fixed.** `Backend/src/utils/deadlines.ts` holds every budget, and the rule it encodes is an
inequality rather than a set of numbers: **a call inside a breaker gets a transport timeout at or
below the breaker's**, so the transport aborts before the breaker abandons a request that is still
running. `deadlines.test.ts` asserts those relationships, so moving a breaker fails the test instead
of silently leaving a call unbounded. The cache client gets a `commandTimeout` — one constructor
option that makes all four existing fail-open handlers reachable. The JWKS is hoisted to module scope
with its timeout stated explicitly rather than inherited, and the Supabase fallback is bounded. Judge0
and Gemini get real transport timeouts; the embedding call, the only Gemini path with no breaker at
all, gets the one bound it has ever had. SMTP gets connection/greeting/socket timeouts, because it
holds a Bull worker's single concurrency slot while it waits.

**Written up rather than half-fixed**, because each is a design change and not a timeout:
the shared `judge0Breaker` behind an unbounded per-user `Promise.all` (it wants the per-key treatment
`llmService` already has, plus a concurrency bound); `getWithLock`'s unbounded recursion, which spins
every waiter at 100 ms against a dependency that is already slow, under a 5 s lock that expires while
its holder still runs; and `transactionManager`, whose `Promise.race` rejects the caller without
rolling anything back and then starts a second and third transaction on top of the first two still
holding their locks. See `docs/SLOW-DEPENDENCIES.md`.

> **The lesson:** a circuit breaker, a retry policy and a fail-open fallback are all *downstream of
> something noticing*. They are machinery for reacting to news, and the only thing that manufactures
> news out of silence is a timeout. Counting the breakers in a codebase measures how seriously it
> takes failure; it says nothing about whether any request is bounded. Ask instead, of every
> protective mechanism: **what delivers the news, and what happens if nothing ever does?**


---

## 14. The same commit, hardened on one host and not on the other

`api-eduscale.vercel.app` and `api.eduscale.exaveltech.com` are two Vercel projects serving this
backend. On 2026-09-06 both were on commit `953fab9` — byte-identical builds of `main`. Asked the
same questions, they answered differently:

| Probe | `api-eduscale.vercel.app` | `api.eduscale.exaveltech.com` |
| --- | --- | --- |
| `GET /metrics` | `404 Route not found` | **`200`, the full Prometheus registry** |
| `GET /api/v1/debug-sentry` | `404` | **`500` + a filesystem stack trace** |
| `Set-Cookie: XSRF-TOKEN` | `…; Secure; SameSite=Strict` | **no `Secure`** |
| `Content-Security-Policy` | present | **absent** |
| `Cross-Origin-Embedder-Policy` | `require-corp` | **absent** |
| rate limit | `RateLimit-Limit: 100` | **10,000 per window** |

Nothing was broken. Both deployments were green, both said Ready, and the only visible difference
was one word in a health response nobody reads: `"environment": "development"`.

### One variable, thirteen decisions

Every row of that table is the same line of code, written thirteen times:

```ts
process.env.NODE_ENV === 'production'
```

It decided the CSP and COEP, the `Secure` flag on the CSRF and refresh cookies, the general and
per-battle rate-limit ceilings, the strict CORS branch, whether `/metrics` is gated, whether the
always-throwing `/debug-sentry` smoke-test route is mounted, whether stack traces reach the client,
the Swagger server label, and the log level and format.

`NODE_ENV` is not a fact about where the process is running. It is a string a human types into a
project's settings, once per project. Vercel does not set it — Vercel sets `VERCEL_ENV`. So the
second project's production environment had a `NODE_ENV` that was not `production`, and thirteen
independent security decisions all resolved the same wrong way at once.

### Why nothing caught it

- **CI could not.** The build is identical; the defect is in the environment the build lands in.
- **The health check could not.** It reported `NODE_ENV` verbatim, and no checker treats the string
  `"development"` as a failure — it is a perfectly ordinary value.
- **A test could not,** in the shape tests were being written. Every one of the thirteen call sites
  had correct behaviour under `NODE_ENV=production` and correct behaviour under `development`. The
  code was right. The input was wrong, and no test asserts what happens when nobody sets the input.

The one signal that existed was `"environment": "development"` in a 503 body, and the 503 was for an
unrelated Redis outage on that host.

### The fix: production is the union of the signals, not one of them

`Backend/src/config/runtimeMode.ts` is now the only place allowed to read `process.env.NODE_ENV` for
a mode decision, and it answers **production when either the runtime or the platform says so**:

```ts
const isProduction = nodeEnv === 'production' || platformEnv === 'production';
```

The asymmetry is the whole point. A variable nobody set must not be able to *widen* what the server
allows; it may only make the logs noisier. `useSecureCookies` goes further and is true on **any**
hosted deployment, previews included — every Vercel URL is HTTPS, so `Secure` always works there,
and a preview that drops it is the same defect one environment over. `isDevelopment` — which gates
stack traces in responses and an ungated `/metrics` — is now true only on a machine that is neither
production nor hosted, so an internet-reachable preview no longer counts as a laptop.

The mismatch is not swallowed. It is written to stderr at startup, logged as an error when the
server binds, and reported in `/api/v1/health` as a `nodeEnvMismatch` object — visible to the same
checker that already compares live against `main`.

`src/tests/security/runtimeMode.test.ts` holds the truth table, replays the two live regressions
against the real middleware (`/metrics` handler → 404, `setCsrfToken` → `secure: true`, both with
`NODE_ENV` deleted and `VERCEL_ENV=production`), and **ratchets** the raw reads: it walks every
non-test source file, skips comment lines, and fails on any `process.env.NODE_ENV` outside a
three-entry allow-list that is itself checked for rot. Verified by planting one in `utils/logger.ts`
— the test fails and names the file.

> **The lesson:** a configuration flag with two states has a third — *unset* — and that is the one
> the code never states an opinion about. `NODE_ENV === 'production'` is not a question about the
> environment; it is a question about a string, and it answers "no" identically for "this is
> development" and for "nobody told me." Wherever those two must not mean the same thing, ask what
> the *absence* of the variable does, and make sure it is the safe direction. Then check whether the
> platform already knows the answer — it did here, in `VERCEL_ENV`, the whole time.
