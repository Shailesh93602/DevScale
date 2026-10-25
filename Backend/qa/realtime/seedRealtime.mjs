// Idempotent seed for the local realtime proof: STUDENT/ADMIN roles and 8 pool questions.
// Plain `pg` on RT_DATABASE_URL; refuses anything not local and named *_test / *_e2e.
import crypto from 'node:crypto';
import pg from 'pg';

const url = process.env.RT_DATABASE_URL || '';
let parsed;
try {
  parsed = new URL(url);
} catch {
  parsed = null;
}
const dbName = parsed?.pathname.replace(/^\//, '') ?? '';
if (
  !parsed ||
  !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
  !/_(test|e2e)$/.test(dbName)
) {
  console.error(
    `REFUSING TO SEED: RT_DATABASE_URL must be a local *_test/*_e2e database (got ${url.replace(/:[^:@/]*@/, ':***@') || 'nothing'}).`
  );
  process.exit(2);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
const {
  rows: [{ current_database: live }],
} = await client.query('select current_database()');
if (live !== dbName) {
  console.error(
    `REFUSING TO SEED: connection opened "${live}", expected "${dbName}".`
  );
  process.exit(2);
}

const QUIZ_ID = '00000000-0000-4000-8000-00000000a001';
const QUESTIONS = 8;

await client.query('BEGIN');
for (const name of ['STUDENT', 'ADMIN']) {
  await client.query(
    `INSERT INTO roles (id, name, description, updated_at) VALUES ($1, $2, $2, now())
     ON CONFLICT (name) DO NOTHING`,
    [crypto.randomUUID(), name]
  );
}
await client.query(
  `INSERT INTO "Quiz" (id, title, description, type, passing_score, updated_at)
   VALUES ($1, 'Realtime proof', 'Local realtime proof questions', 'MCQ', 50, now())
   ON CONFLICT (id) DO NOTHING`,
  [QUIZ_ID]
);
const {
  rows: [{ count }],
} = await client.query(
  'SELECT count(*)::int AS count FROM "Question" WHERE quiz_id = $1',
  [QUIZ_ID]
);
for (let i = count; i < QUESTIONS; i++) {
  const qid = crypto.randomUUID();
  const correct = `Answer ${i} (right)`;
  await client.query(
    `INSERT INTO "Question" (id, quiz_id, question, type, correct_answer, points, updated_at)
     VALUES ($1, $2, $3, 'MCQ', $4, 10, now())`,
    [qid, QUIZ_ID, `Realtime proof question ${i}?`, correct]
  );
  for (const text of [
    correct,
    `Answer ${i} (wrong 1)`,
    `Answer ${i} (wrong 2)`,
    `Answer ${i} (wrong 3)`,
  ]) {
    await client.query(
      `INSERT INTO "Option" (id, text, is_correct, question_id, updated_at) VALUES ($1, $2, $3, $4, now())`,
      [crypto.randomUUID(), text, text === correct, qid]
    );
  }
}
await client.query('COMMIT');
console.log(`seeded ${live}: roles STUDENT/ADMIN, ${QUESTIONS} pool questions`);
await client.end();
