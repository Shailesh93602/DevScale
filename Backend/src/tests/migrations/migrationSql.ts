import fs from 'node:fs';
import path from 'node:path';

// SQL scanner behind migrationIdempotency.test.ts; its own tests are in migrationAnalyzer.test.ts.

const MIGRATIONS_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'prisma',
  'migrations'
);

export type RuleId =
  | 'CREATE INDEX'
  | 'CREATE TABLE'
  | 'CREATE EXTENSION'
  | 'ADD COLUMN'
  | 'CREATE TYPE'
  | 'ADD CONSTRAINT';

export interface Offender {
  rule: RuleId;
  statement: string;
}

export type RuleCounts = Partial<Record<RuleId, number>>;

/**
 * Full-line `--` comments only. The prose in these files talks ABOUT
 * `CREATE INDEX` at length — `20260829170000_audit_indexes` explains why it is
 * not using `CONCURRENTLY` — and a scanner that reads comments as code would
 * report the explanation as the offence.
 */
function stripComments(sql: string): string {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
}

/**
 * Split on `;`, but not on a `;` inside a dollar-quoted body. Without this the
 * `DO $$ ... $$` block that is the ONLY way to guard a `CREATE TYPE` would be
 * chopped into fragments, and the guard would read as an offence — the rule
 * would reject its own remedy.
 */
export function splitStatements(sql: string): string[] {
  const src = stripComments(sql);
  const out: string[] = [];
  let buffer = '';
  let tag: string | null = null;

  for (let i = 0; i < src.length; i++) {
    if (tag === null) {
      const opening = /^\$[A-Za-z_]*\$/.exec(src.slice(i));
      if (opening) {
        buffer += opening[0];
        i += opening[0].length - 1;
        tag = opening[0];
        continue;
      }
      if (src[i] === ';') {
        out.push(buffer);
        buffer = '';
        continue;
      }
      buffer += src[i];
    } else {
      if (src.startsWith(tag, i)) {
        buffer += tag;
        i += tag.length - 1;
        tag = null;
        continue;
      }
      buffer += src[i];
    }
  }
  out.push(buffer);

  return out.map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function occurrences(pattern: RegExp, text: string): number {
  return (text.match(pattern) ?? []).length;
}

/** Rules with a native `IF NOT EXISTS`, expressed as total minus guarded. */
const NATIVE_RULES: Array<{
  id: RuleId;
  total: RegExp;
  guarded: RegExp;
  exempt?: RegExp;
}> = [
  {
    id: 'CREATE INDEX',
    total: /\bCREATE\s+(?:UNIQUE\s+)?INDEX\b/gi,
    guarded:
      /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?IF\s+NOT\s+EXISTS\b/gi,
    // CONCURRENTLY cannot run in Prisma's migration transaction, so it is out
    // of scope rather than merely allowed. The lookahead keeps a guarded
    // CONCURRENTLY index from being subtracted twice.
    exempt:
      /\bCREATE\s+(?:UNIQUE\s+)?INDEX\s+CONCURRENTLY\s+(?!IF\s+NOT\s+EXISTS\b)/gi,
  },
  {
    id: 'CREATE TABLE',
    total: /\bCREATE\s+TABLE\b/gi,
    guarded: /\bCREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\b/gi,
  },
  {
    id: 'CREATE EXTENSION',
    total: /\bCREATE\s+EXTENSION\b/gi,
    guarded: /\bCREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\b/gi,
  },
  {
    id: 'ADD COLUMN',
    total: /\bADD\s+COLUMN\b/gi,
    guarded: /\bADD\s+COLUMN\s+IF\s+NOT\s+EXISTS\b/gi,
  },
];

const DO_BLOCK = /\bDO\s+\$/i;
const HANDLES_DUPLICATE =
  /\bEXCEPTION\b[\s\S]*\bWHEN\b[\s\S]*?\b(?:duplicate_object|duplicate_table|duplicate_column|duplicate_schema)\b/i;

/** The `DO $$ ... EXCEPTION WHEN duplicate_object ... $$` remedy. */
function isDoBlockGuarded(statement: string): boolean {
  return DO_BLOCK.test(statement) && HANDLES_DUPLICATE.test(statement);
}

const ADD_CONSTRAINT_NAMED =
  /\bADD\s+CONSTRAINT\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const DROP_CONSTRAINT_GUARDED =
  /\bDROP\s+CONSTRAINT\s+IF\s+EXISTS\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const CREATE_TYPE_NAMED = /\bCREATE\s+TYPE\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;
const DROP_TYPE_GUARDED =
  /\bDROP\s+TYPE\s+IF\s+EXISTS\s+(?:"?[\w-]+"?\.)?"?([\w-]+)"?/gi;

function preview(statement: string): string {
  return statement.length > 120 ? `${statement.slice(0, 117)}...` : statement;
}

/**
 * Every object creation in one migration file that would raise `42P07`/`42710`
 * against a database that already holds the object.
 *
 * Counting is per OCCURRENCE, not per statement: a single
 * `ALTER TABLE x ADD COLUMN a, ADD COLUMN b` guards two things or none, and
 * "the statement has a guard somewhere in it" is not the property that matters.
 */
export function analyze(sql: string): Offender[] {
  const offenders: Offender[] = [];
  const droppedConstraints = new Set<string>();
  const droppedTypes = new Set<string>();

  for (const statement of splitStatements(sql)) {
    // Collected before the offence check so that a DROP and an ADD in the SAME
    // statement pair up, and so that a DROP later in the file does not
    // retroactively excuse an earlier ADD.
    for (const m of statement.matchAll(DROP_CONSTRAINT_GUARDED)) {
      droppedConstraints.add(m[1]);
    }
    for (const m of statement.matchAll(DROP_TYPE_GUARDED)) {
      droppedTypes.add(m[1]);
    }

    if (isDoBlockGuarded(statement)) continue;

    for (const rule of NATIVE_RULES) {
      const unguarded =
        occurrences(rule.total, statement) -
        occurrences(rule.guarded, statement) -
        (rule.exempt ? occurrences(rule.exempt, statement) : 0);
      for (let i = 0; i < unguarded; i++) {
        offenders.push({ rule: rule.id, statement: preview(statement) });
      }
    }

    for (const m of statement.matchAll(CREATE_TYPE_NAMED)) {
      if (!droppedTypes.has(m[1])) {
        offenders.push({ rule: 'CREATE TYPE', statement: preview(statement) });
      }
    }
    for (const m of statement.matchAll(ADD_CONSTRAINT_NAMED)) {
      if (!droppedConstraints.has(m[1])) {
        offenders.push({
          rule: 'ADD CONSTRAINT',
          statement: preview(statement),
        });
      }
    }
  }

  return offenders;
}

export function countByRule(offenders: Offender[]): RuleCounts {
  const counts: RuleCounts = {};
  for (const o of offenders) counts[o.rule] = (counts[o.rule] ?? 0) + 1;
  return counts;
}

export function migrationDirs(): string[] {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) =>
      fs.existsSync(path.join(MIGRATIONS_DIR, name, 'migration.sql'))
    )
    .sort();
}

export function readMigration(dir: string): Buffer {
  return fs.readFileSync(path.join(MIGRATIONS_DIR, dir, 'migration.sql'));
}

/**
 * Jest's `expect` takes no message argument (that is Vitest), so the guidance
 * has to travel in the value being compared. Each offender is rendered as a
 * line, and the assertion is against the list — a failure then prints the
 * exact statements rather than a bare count.
 */
export function renderOffenders(offenders: Offender[]): string[] {
  return offenders.map((o) => `${o.rule} — ${o.statement}`);
}
