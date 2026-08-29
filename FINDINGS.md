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

But that is the *teardown being careful*, not anything preventing the connection. A killed process, a
crash between create and delete, or a `where` clause widened by a refactor all end the same way — and
they end there silently.

**Fix:** two checks, because one is not enough. The URL string must name a local throwaway, *and* the
live connection is asked which database it actually opened. The second exists because the first
validates a string and cannot know where the client went.

> **The lesson:** the sibling repo has the identical trap in a different form — running
> `DATABASE_URL=…/local npx prisma migrate deploy` there connects to **production**, because the
> Prisma CLI loads the repo's `.env` in preference to the shell. It announces
> *"Environment variables loaded from .env"* and then does something else entirely.
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
> accepted, and there is now a test asserting `postgres` is refused *even on localhost*.

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
> database *name*; the URL check already covers the host. Choosing the signal that is actually
> discriminating matters more than adding another check.

---

## 4. 143 tests that had no bearing on anything

The pipeline was audit + lint + typecheck + build. **No test job, in either package.** So 143 backend
tests and 5 frontend tests existed, passed locally, and could not block a merge. A change could break
every assertion in the repo and still go green.

Worse than the security audit that was failing on every PR since June — at least that was *visibly*
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

The AI code-review endpoint was documented as idempotent: *"a second call returns the stored review."*

```ts
findAiReviewBySubmission(submissionId)   // findFirst — nothing unique behind it
createAiReview({ ... })                  // plain create
```

The schema had `@@index([submission_id])` — a plain index, **not unique**. True sequentially, false
under concurrency: two concurrent requests both miss the read, **both call Gemini**, and both insert.

Each duplicate is a real paid LLM call on a project with ~zero free quota, and the trigger is a
double-click on a slow button.

**The tell was already in the code:** `orderBy: { created_at: 'desc' }` in the finder. Ordering only
matters if more than one row can exist — the code *anticipated* duplicates and coped with them
instead of preventing them.

Fixed by making the constraint the guarantee and the read a fast path. Then fixed again: the claim now
happens **before** the LLM call, so the loser of a race no longer pays for a generation it discards —
with release-on-failure, and stale-claim takeover whose predicate lives inside the mutation.

---

## 7. Four migrations that production did not have

Nothing applied migrations on deploy. The build was `tsc && tsc-alias`, with `prisma generate` in
postinstall — and `generate` rebuilds the *client*, never the database.

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
legitimate connection, are both mistakes made *while being careful*.

The rest share a pattern — each was **correct under the conditions it was tested in**:

- an idempotency check that holds sequentially and fails concurrently
- a suite that is hermetic on a machine that has the config
- a test that is flaky over a network and instant against a local database
- a build step that handles the client and looks like it handles the database
