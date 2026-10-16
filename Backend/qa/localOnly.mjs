// Imported right after 'dotenv/config' by every QA entry point. The QA areas
// create, delete and probe rows (role escalation, IDOR edits) — Backend/.env
// points at production, so refuse unless both the database and the backend
// under test are local. Evaluated on import, before any client is built.
const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/;

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

const db = process.env.DATABASE_URL || '';
const base = process.env.QA_BASE || 'http://localhost:4000/api/v1';
const ws = process.env.QA_WS || 'http://localhost:4000';

const problems = [];
if (!LOCAL.test(hostOf(db))) {
  problems.push(`DATABASE_URL is not local (${db.replace(/:[^:@/]*@/, ':***@')})`);
}
if (process.env.QA_ALLOW_REMOTE !== '1') {
  for (const [name, url] of [['QA_BASE', base], ['QA_WS', ws]]) {
    if (!LOCAL.test(hostOf(url))) problems.push(`${name} is not local (${url}); set QA_ALLOW_REMOTE=1 to override`);
  }
}

if (problems.length) {
  console.error(`REFUSING TO RUN QA: ${problems.join('; ')}.\nThe QA areas write and delete rows. Point them at a local database and backend.`);
  process.exit(2);
}
