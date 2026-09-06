# Migrations — how they run, how to write one, and how to recover a failed one

## How they run

`prisma migrate deploy` runs from `Backend/scripts/vercel-build.sh`, **only when
`VERCEL_ENV=production`**. A failed migration fails the build, on purpose: a deploy that cannot
migrate must not go live and start serving errors against a schema it does not have.

That is the right design, and it is also the whole blast radius. Anything that makes
`migrate deploy` refuse to run stops **every** deploy, not only the one carrying the bad
migration — and the site keeps serving the last good build while it does, so nothing looks broken
from outside.

`schema.prisma` declares a `directUrl`, so migrations bypass the Supabase pooler. The runtime client
uses `DATABASE_URL` alone.

CI applies the same chain to a throwaway PostgreSQL service container before running the backend
tests (`.github/workflows/ci.yml`, `backend-test`). That proves the chain applies to an **empty**
database. It cannot prove anything about a database that already holds objects — which is the case
this document is about.

---

## 🔴 Before ANY Prisma command run from `Backend/`

`Backend/.env` points `DATABASE_URL` and `DIRECT_URL` at **production Supabase**, and
`Backend/prisma.config.ts` loads that file explicitly:

```ts
config({ path: join(__dirname, '.env') });
```

So exporting `DATABASE_URL` in your shell does **not** redirect the CLI. This connects to
production:

```bash
DATABASE_URL=postgresql://localhost/whatever npx prisma migrate deploy   # ← hits PRODUCTION
```

**Always run `npx prisma migrate status` first and read the `Datasource "db"` line it prints.** That
line, not the variable you set, is the database you are about to change.

To work against a scratch database, work from a directory that has **no** `.env` and no
`prisma.config.ts`, copy `prisma/schema.prisma` and `prisma/migrations/` there, and pass
`--schema /full/path/to/that/copy/schema.prisma` with `DATABASE_URL` and `DIRECT_URL` set in the
command environment:

```bash
# pgvector is built for postgresql@17/@18 only; the brew default (@16) cannot
# CREATE EXTENSION vector, so the chain will not replay on it.
/opt/homebrew/opt/postgresql@17/bin/pg_ctl -D /opt/homebrew/var/postgresql@17 \
  -o "-p 5434" -l /tmp/pg17.log start
psql -p 5434 -h 127.0.0.1 -d postgres -c "CREATE DATABASE eduscale_scratch;"

mkdir -p /tmp/replay/prisma && cd /tmp/replay
cp <repo>/Backend/prisma/schema.prisma prisma/
cp -R <repo>/Backend/prisma/migrations prisma/

U="postgresql://$(whoami)@127.0.0.1:5434/eduscale_scratch"
DATABASE_URL="$U" DIRECT_URL="$U" \
  <repo>/Backend/node_modules/.bin/prisma migrate deploy --schema /tmp/replay/prisma/schema.prisma
```

Then read the datasource line to confirm where you landed.

---

## Writing a migration

**Every object a migration creates must be created in a form that tolerates the object already
existing.** `Backend/src/tests/migrations/migrationIdempotency.test.ts` enforces this and explains
why at length. The short version is below.

### The rule

| Statement                       | Write it as                                            |
| ------------------------------- | ------------------------------------------------------ |
| `CREATE INDEX` / `CREATE UNIQUE INDEX` | `CREATE INDEX IF NOT EXISTS`                     |
| `CREATE TABLE`                  | `CREATE TABLE IF NOT EXISTS`                           |
| `CREATE EXTENSION`              | `CREATE EXTENSION IF NOT EXISTS`                       |
| `ALTER TABLE … ADD COLUMN`      | `ALTER TABLE … ADD COLUMN IF NOT EXISTS`               |
| `CREATE TYPE`                   | no native guard — see below                            |
| `ALTER TABLE … ADD CONSTRAINT`  | no native guard — see below                            |

PostgreSQL has no `IF NOT EXISTS` for types or constraints. A duplicate raises `42710`, which wedges
the deploy exactly as `42P07` does, so those two are still enforced — with a different spelling.
Either drop first:

```sql
ALTER TABLE "A" DROP CONSTRAINT IF EXISTS "A_b_fkey";
ALTER TABLE "A" ADD  CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");
```

or swallow the duplicate:

```sql
DO $$ BEGIN
  ALTER TABLE "A" ADD CONSTRAINT "A_b_fkey" FOREIGN KEY ("b") REFERENCES "B"("id");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
```

The `DO` block counts as a guard **only** when it handles `duplicate_object` (or
`duplicate_table` / `duplicate_column` / `duplicate_schema`). A block with no handler raises the same
error and is not a guard.

`CREATE INDEX CONCURRENTLY` is exempt, because it cannot run inside a migration at all — Prisma
wraps each migration in a transaction and PostgreSQL answers `25001 CREATE INDEX CONCURRENTLY cannot
run inside a transaction block`. That was tried in `20260829170000_audit_indexes` and it failed
against a real PostgreSQL 17 before the file was rewritten. A concurrent index is an out-of-band
conversation, not something the guard rule can help with.

**A related hazard the test does not enforce:** a bare `DROP CONSTRAINT` (three migrations do this)
raises `42704` against a database that does not have it, and wedges the deploy identically. Write
`DROP … IF EXISTS` in anything new.

### Never edit a migration production has applied

Prisma records each applied migration's sha256 in `_prisma_migrations.checksum`. Editing the file
makes the next `migrate deploy` refuse with **P3006** (*"migration … was modified after it was
applied"*), which stops every deploy — and unlike P3009 there is nothing in the repository that
fixes it. Write a **new** migration instead.

Every migration is pinned by hash in `migrationIdempotency.test.ts`. Add the new one's hash in the
same PR that adds the migration:

```bash
shasum -a 256 Backend/prisma/migrations/<name>/migration.sql
```

### Why the rule exists

A production database can legitimately already hold an object a migration creates. Migrations run by
hand, migrations applied from another branch, an index added during an incident, a managed-platform
hardening script, a restore from a snapshot taken at a different point in the history — none of those
are visible in this repository, and all of them are normal.

This is not hypothetical for EduScale. Two of the fifteen migrations —
`20260615000000_drop_quizquestion_system_b` and `20260615010000_enums_to_text` — carry
`applied_steps_count = 0` with `started_at = finished_at` in production, the signature of
`migrate resolve --applied`. Their SQL was executed out of band and Prisma was told about it
afterwards. The effects are in production and nothing is wrong; but DDL demonstrably reaches this
database by routes the repository does not record.

A migration's job is to make the database **match** the schema afterwards, not to assert what the
database did not have beforehand. `IF NOT EXISTS` states the first; a bare `CREATE INDEX` quietly
states the second, inside a transaction that takes every other statement down with it. It costs
nothing when the object is absent, and it is the difference between a no-op and a week of dead
deploys when it is present — which is what happened to the sibling repo, KhataGO.

---

## Recovering a failed migration

### Recognising it

**`prisma migrate status` will not tell you.** Reproduced on this repo's own chain (Prisma 6.6,
PostgreSQL 17): with `20260906010000_hot_paths` wedged, `migrate status` printed only

```
Following migration have not yet been applied:
20260906020000_queued_behind
To apply migrations in production run prisma migrate deploy.
```

It never named the failed migration and never used the word "failed" — it reads like one ordinary
pending migration, and `migrate deploy` will never apply it.

The reliable diagnostic is the table:

```sql
SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count
FROM _prisma_migrations
WHERE finished_at IS NULL
ORDER BY started_at DESC;
```

A row with `finished_at IS NULL` **and** `rolled_back_at IS NULL` is a failed migration. From then on
`migrate deploy` answers:

```
Error: P3009
migrate found failed migrations in the target database, new migrations will not be applied.
The `<name>` migration started at <t> failed
```

PostgreSQL already rolled that migration's statements back — DDL is transactional — so the database
does **not** hold a half-applied migration. What is stuck is Prisma's bookkeeping.

### The procedure

Verified end to end on a scratch PostgreSQL 17 replay of this repo's chain (2026-09-06): an
out-of-band index, a bare `CREATE INDEX` over it, `42P07` → `P3018`, `P3009` on the next deploy, then
the four steps below → both the repaired migration and the one queued behind it applied, and a second
`deploy` was a no-op.

**1. Fix the migration so re-running it succeeds.** Nothing below helps if the file that failed is
still going to fail. Repair it, and prove the repair on a scratch database put into production's
state by hand (create the objects it collided with first). Merge that, and `git pull` on whatever
runs the recovery — `migrate deploy` runs whatever file is on disk.

**2. Confirm what you are pointed at.**

```bash
npx prisma migrate status
```

Read the `Datasource "db"` line. It must name the database you intend to repair.

**3. Mark the failed migration as rolled back.**

```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

This only writes `rolled_back_at` on that row. It changes no schema. Prisma then treats the migration
as un-applied and will apply it again — using the repaired file, and **without** comparing checksums,
which is why editing the file in step 1 is safe here and only here.

Use `--applied` instead only when the migration's statements *did* all take effect and you are
recording that fact. For a transactional failure like `42P07` that is wrong: nothing took effect.

**4. Apply.**

```bash
npx prisma migrate deploy
```

**5. Verify, then redeploy.** Re-run `migrate deploy` once more — it must say `No pending migrations
to apply` — and check the objects the migration was supposed to create. Then trigger the deploy; its
build step will find nothing pending.

---

## Drift check (read-only, safe to run any time)

The question worth asking is not "does today's command still work?" but "what does the drift make
possible later?" Answer it by replaying the chain onto an empty PostgreSQL 17 and diffing the object
inventory against production. Run these read-only against production and the same four against the
replay:

```sql
SELECT migration_name, finished_at, rolled_back_at, applied_steps_count FROM _prisma_migrations ORDER BY started_at;
SELECT indexname FROM pg_indexes WHERE schemaname='public' ORDER BY 1;
SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY 1;
SELECT table_name||'.'||column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' ORDER BY 1;
SELECT conname FROM pg_constraint c JOIN pg_namespace n ON n.oid=c.connamespace WHERE n.nspname='public' ORDER BY 1;
```

`comm -23` in one direction finds objects production holds that the repo does not create — the ones a
future bare `CREATE …` will collide with.

**Measured 2026-09-06:** production's `_prisma_migrations` holds exactly the 15 migrations in this
repo, none unfinished, none rolled back, and all 15 recorded checksums equal the files on disk. The
replay produced an identical object set — 356 indexes, 126 tables, 1001 columns (same types,
defaults and nullability), 285 constraints — empty diff in both directions. The only difference is
extensions: production additionally has `pgcrypto`, `uuid-ossp`, `pg_net`, `pg_stat_statements` and
`supabase_vault`, all Supabase-managed and living in the `extensions` / `vault` schemas rather than
`public`. That is harmless today and is exactly why `CREATE EXTENSION` is in the guard rule.
