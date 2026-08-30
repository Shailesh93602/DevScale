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
