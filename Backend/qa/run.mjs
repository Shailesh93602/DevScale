// Functional QA runner — logs in as REAL roles and asserts REAL outcomes
// (HTTP status + response shape + DB state), not "does it render".
// Run: node qa/run.mjs   (backend must be up on :4000)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const BASE = process.env.QA_BASE || 'http://localhost:4000/api/v1';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
const prisma = new PrismaClient();

const USERS = {
  student: { email: 'testuser@yopmail.com', password: 'Test@123' },
  student2: { email: 'battleplayer2@yopmail.com', password: 'Test@1234' },
  admin: { email: 'admin@eduscale.io', password: 'Admin@123' },
  moderator: { email: 'moderator@eduscale.io', password: 'Mod@123' },
};

const results = [];
let only = process.argv[2]; // optional area filter
function rec(area, name, pass, detail = '') {
  results.push({ area, name, pass, detail });
  const tag = pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  console.log(`${tag}  [${area}] ${name}${detail ? '  — ' + detail : ''}`);
}

async function login(which) {
  const u = USERS[which];
  const { data, error } = await sb.auth.signInWithPassword(u);
  if (error) throw new Error(`login ${which} failed: ${error.message}`);
  return data.session.access_token;
}

// Double-submit CSRF: the middleware only checks cookie === header, so we send
// a matching pair on state-changing methods (exactly what the browser does).
const CSRF = 'qa-csrf-token';
async function api(method, path, { token, body } = {}) {
  const mutating = !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(mutating ? { 'x-xsrf-token': CSRF, Cookie: `XSRF-TOKEN=${CSRF}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-json */ }
  return { status: res.status, json };
}

async function main() {
  const tok = {};
  for (const k of Object.keys(USERS)) {
    try { tok[k] = await login(k); rec('auth', `login ${k}`, true); }
    catch (e) { rec('auth', `login ${k}`, false, e.message); }
  }

  // ---------- AUTH & AUTHORIZATION ----------
  if (!only || only === 'auth') {
    let r = await api('GET', '/users/me', { token: tok.student });
    rec('auth', 'GET /users/me (student) → 200 + role STUDENT', r.status === 200 && r.json?.data?.role?.name === 'STUDENT', `status=${r.status} role=${r.json?.data?.role?.name}`);

    r = await api('GET', '/users/me', { token: tok.admin });
    rec('auth', 'GET /users/me (admin) → role ADMIN', r.status === 200 && r.json?.data?.role?.name === 'ADMIN', `role=${r.json?.data?.role?.name}`);

    r = await api('GET', '/users/me', {});
    rec('auth', 'GET /users/me (no token) → 401', r.status === 401, `status=${r.status}`);

    r = await api('GET', '/users/me', { token: 'garbage.token.here' });
    rec('auth', 'GET /users/me (bad token) → 401', r.status === 401, `status=${r.status}`);

    r = await api('GET', '/admin/users', { token: tok.student });
    rec('auth', 'student → GET /admin/users → 403', r.status === 403, `status=${r.status}`);

    r = await api('GET', '/admin/users', { token: tok.admin });
    rec('auth', 'admin → GET /admin/users → 200', r.status === 200, `status=${r.status}`);

    // Logout blocklist: token must be rejected AFTER logout
    const ses = await sb.auth.signInWithPassword(USERS.student2);
    const t2 = ses.data.session.access_token;
    const before = await api('GET', '/users/me', { token: t2 });
    const lo = await api('POST', '/auth/logout', { token: t2 });
    const after = await api('GET', '/users/me', { token: t2 });
    rec('auth', 'logout blocklists token (me 200 → logout → me 401)', before.status === 200 && after.status === 401, `before=${before.status} logout=${lo.status} after=${after.status}`);
  }

  // ---------- AUTHZ CASE BUG (admin-only routes with lowercase 'admin') ----------
  if (!only || only === 'authz') {
    // These routes are gated authorizeRoles('admin') (lowercase) while real role is 'ADMIN'.
    // EXPECTED (after fix): admin gets through (200/!403). Currently asserts the bug if 403.
    const ra = await api('GET', '/analytics/platform', { token: tok.admin }).catch(() => ({ status: 0 }));
    rec('authz', "admin → GET /analytics/platform not falsely 403 (lowercase-role case bug)", ra.status !== 403, `status=${ra.status}`);
    // a student must still be denied
    const rs = await api('GET', '/analytics/platform', { token: tok.student }).catch(() => ({ status: 0 }));
    rec('authz', 'student → GET /analytics/platform → 403', rs.status === 403, `status=${rs.status}`);
  }

  // ---------- DASHBOARD ----------
  if (!only || only === 'dashboard') {
    const r = await api('GET', '/dashboard/summary', { token: tok.student });
    const d = r.json?.data;
    rec('dashboard', 'GET /dashboard/summary (student) → 200 + shape', r.status === 200 && !!d && ('stats' in d || 'enrolledRoadmaps' in d || 'streak' in d), `status=${r.status} keys=${d ? Object.keys(d).join(',') : 'none'}`);
  }

  // ---------- ROADMAPS ----------
  if (!only || only === 'roadmaps') {
    const list = await api('GET', '/roadmaps?limit=5', { token: tok.student });
    const items = list.json?.data?.roadmaps || list.json?.data?.data || list.json?.data || [];
    const arr = Array.isArray(items) ? items : (items.roadmaps || []);
    rec('roadmaps', 'GET /roadmaps → 200 non-empty', list.status === 200 && arr.length > 0, `status=${list.status} count=${arr.length}`);

    const rm = arr[0];
    if (rm) {
      const me = await api('GET', '/users/me', { token: tok.student });
      const userId = me.json?.data?.id;
      // clean any prior enrollment for a deterministic assert
      await prisma.userRoadmap.deleteMany({ where: { user_id: userId, roadmap_id: rm.id } }).catch(() => {});
      const en = await api('POST', '/roadmaps/enroll', { token: tok.student, body: { roadmapId: rm.id } });
      const row = await prisma.userRoadmap.findFirst({ where: { user_id: userId, roadmap_id: rm.id } });
      rec('roadmaps', 'enroll persists a UserRoadmap row', en.status >= 200 && en.status < 300 && !!row, `status=${en.status} row=${!!row}`);

      const en2 = await api('POST', '/roadmaps/enroll', { token: tok.student, body: { roadmapId: rm.id } });
      const count = await prisma.userRoadmap.count({ where: { user_id: userId, roadmap_id: rm.id } });
      rec('roadmaps', 're-enroll is idempotent (no duplicate row, no 500)', en2.status < 500 && count === 1, `status=${en2.status} count=${count}`);

      const enrollBad = await api('POST', '/roadmaps/enroll', { token: tok.student, body: {} });
      rec('roadmaps', 'enroll without roadmapId → 4xx (validation)', enrollBad.status >= 400 && enrollBad.status < 500, `status=${enrollBad.status}`);

      const like1 = await api('POST', `/roadmaps/${rm.id}/like`, { token: tok.student });
      rec('roadmaps', 'like roadmap → 2xx', like1.status >= 200 && like1.status < 300, `status=${like1.status}`);
    }
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
