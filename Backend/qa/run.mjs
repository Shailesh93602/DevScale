// Functional QA runner — logs in as REAL roles and asserts REAL outcomes
// (HTTP status + response shape + DB state), not "does it render".
// Run: node qa/run.mjs [area]   (backend must be up on :4000)
import { login, prisma, rec, results, USERS } from './lib.mjs';
import * as access from './areas/access.mjs';
import * as articles from './areas/articles.mjs';
import * as battle from './areas/battle.mjs';
import * as learning from './areas/learning.mjs';

const only = process.argv[2]; // optional area filter

const AREA_FNS = { ...access, ...learning, ...articles, ...battle };
// Run in the order the areas were written; a filter runs exactly one.
const AREAS = ['auth', 'authz', 'dashboard', 'roadmaps', 'profile', 'content', 'challenges', 'battles', 'artwrite', 'social', 'code', 'mod', 'submit', 'more', 'resource', 'detail', 'quiz', 'rbac', 'idor', 'concurrency', 'ratelimit', 'xss', 'exec'];

async function main() {
  const tok = {};
  for (const k of Object.keys(USERS)) {
    try { tok[k] = await login(k); rec('auth', `login ${k}`, true); }
    catch (e) { rec('auth', `login ${k}`, false, e.message); }
  }

  for (const area of AREAS) {
    if (!only || only === area) await AREA_FNS[area]({ tok });
  }

  // ---------- SUMMARY ----------
  const fail = results.filter((r) => !r.pass);
  console.log(`\n──────── ${results.length - fail.length}/${results.length} passed ────────`);
  if (fail.length) {
    console.log('FAILURES:');
    fail.forEach((f) => console.log(`  ✗ [${f.area}] ${f.name} — ${f.detail}`));
  }
  await prisma.$disconnect();
  process.exit(fail.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });

