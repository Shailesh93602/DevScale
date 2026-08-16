// Functional QA runner — logs in as REAL roles and asserts REAL outcomes
// (HTTP status + response shape + DB state), not "does it render".
// Run: node qa/run.mjs   (backend must be up on :4000)
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { TEST_USERS as USERS } from './testUsers.mjs';

const BASE = process.env.QA_BASE || 'http://localhost:4000/api/v1';
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY);
const prisma = new PrismaClient();


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

    // admin metrics system health — cacheStatus was hardcoded-broken (always 'error')
    const m = await api('GET', '/admin/dashboard/metrics', { token: tok.admin });
    const cache = m.json?.data?.systemHealth?.cacheStatus;
    rec('dashboard', "admin metrics cacheStatus = 'healthy' (real probe, was always error)", m.status === 200 && cache === 'healthy', `status=${m.status} cache=${cache}`);
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

  // ---------- PROFILE (edit must persist + must NOT reset role) ----------
  if (!only || only === 'profile') {
    // Use moderator to prove a privileged role survives a profile save.
    const me = await api('GET', '/users/me', { token: tok.moderator });
    const u = me.json?.data;
    const roleBefore = u?.role?.name;
    const newFirst = (u?.first_name === 'Mod' ? 'Moder' : 'Mod');
    const put = await api('PUT', '/users/me', {
      token: tok.moderator,
      body: { email: u?.email, username: u?.username, first_name: newFirst, last_name: u?.last_name || 'User' },
    });
    const after = await api('GET', '/users/me', { token: tok.moderator });
    const roleAfter = after.json?.data?.role?.name;
    rec('profile', 'PUT /users/me persists first_name', put.status >= 200 && put.status < 300 && after.json?.data?.first_name === newFirst, `status=${put.status} first=${after.json?.data?.first_name}`);
    rec('profile', 'PUT /users/me does NOT reset role (moderator stays moderator)', roleBefore === roleAfter && roleAfter === 'MODERATOR', `before=${roleBefore} after=${roleAfter}`);
  }

  // ---------- ARTICLES / STREAK / RESOURCES (reads) ----------
  if (!only || only === 'content') {
    const pub = await api('GET', '/articles/all', {});
    rec('content', 'GET /articles/all (public) → 200', pub.status === 200, `status=${pub.status}`);
    const mine = await api('GET', '/articles/my-articles', { token: tok.student });
    rec('content', 'GET /articles/my-articles (auth) → 200', mine.status === 200, `status=${mine.status}`);
    const ss = await api('GET', '/streak/stats', { token: tok.student });
    rec('content', 'GET /streak/stats → 200', ss.status === 200, `status=${ss.status}`);
    const sw = await api('GET', '/streak/weekly-activity', { token: tok.student });
    rec('content', 'GET /streak/weekly-activity → 200', sw.status === 200, `status=${sw.status}`);
    const rl = await api('GET', '/resources?page=1&limit=5', { token: tok.student });
    rec('content', 'GET /resources → 200', rl.status === 200, `status=${rl.status}`);
  }

  // ---------- CODING CHALLENGES ----------
  if (!only || only === 'challenges') {
    const list = await api('GET', '/challenges?page=1&limit=5', { token: tok.student });
    const arr = list.json?.data?.challenges || list.json?.data?.data || (Array.isArray(list.json?.data) ? list.json.data : []);
    rec('challenges', 'GET /challenges → 200', list.status === 200, `status=${list.status} count=${arr?.length ?? '?'}`);
    if (arr && arr[0]) {
      const det = await api('GET', `/challenges/${arr[0].id}`, { token: tok.student });
      rec('challenges', 'GET /challenges/:id → 200', det.status === 200, `status=${det.status}`);
    }
  }

  // ---------- BATTLE ZONE (REST lifecycle) ----------
  if (!only || only === 'battles') {
    // A topic that actually has canonical Question rows (post-unification the
    // pool reads Question/Option, so battles can now source from real content).
    const qrow = await prisma.question.findFirst({ where: { quiz: { topic_id: { not: null } } }, select: { quiz: { select: { topic_id: true } } } }).catch(() => null);
    const topicId = qrow?.quiz?.topic_id;
    // Post-unification the pool reads canonical Question/Option, so a battle can
    // be sourced from real topic content. We assert: (1) a genuinely-empty source
    // is rejected gracefully (422, not 500); (2) a real topic source creates a
    // battle WITH populated BattleQuestions; (3) the rest of the lifecycle.
    if (!topicId) {
      rec('battles', 'precondition: a topic with questions exists', false, 'none found');
    } else {
      // Guaranteed-empty source: a non-existent topic id → no questions → 422.
      const emptyPool = await api('POST', '/battles', {
        token: tok.student,
        body: { title: 'QA EmptyPool xx', difficulty: 'EASY', type: 'QUICK', total_questions: 5, question_source: { type: 'topic', id: '00000000-0000-0000-0000-000000000000', count: 5 } },
      });
      rec('battles', 'empty question pool → graceful 422 (not 500)', emptyPool.status === 422, `status=${emptyPool.status}`);

      const create = await api('POST', '/battles', {
        token: tok.student,
        body: {
          title: 'QA Battle ' + topicId.slice(0, 6),
          difficulty: 'EASY',
          type: 'QUICK',
          max_participants: 4,
          total_questions: 5,
          question_source: { type: 'topic', id: topicId, count: 5 },
        },
      });
      const battleId = create.json?.data?.id || create.json?.data?.battle?.id;
      rec('battles', 'create battle from real topic source → 2xx + Battle row', create.status >= 200 && create.status < 300 && !!battleId, `status=${create.status} id=${battleId ? 'yes' : 'no'} ${battleId ? '' : JSON.stringify(create.json?.message || create.json).slice(0, 120)}`);

      if (battleId) {
        const row = await prisma.battle.findUnique({ where: { id: battleId } }).catch(() => null);
        rec('battles', 'created battle persisted in DB', !!row, `row=${!!row} status=${row?.status}`);

        // The unification payoff: the battle has real questions snapshotted in.
        const bqCount = await prisma.battleQuestion.count({ where: { battle_id: battleId } }).catch(() => 0);
        rec('battles', 'battle has questions from canonical pool (BattleQuestion rows)', bqCount > 0, `count=${bqCount}`);

        const get = await api('GET', `/battles/${battleId}`, { token: tok.student });
        rec('battles', 'GET /battles/:id → 200', get.status === 200, `status=${get.status}`);

        // Creator joins their own battle too (not auto-added as a participant).
        await api('POST', `/battles/${battleId}/join`, { token: tok.student });
        const join = await api('POST', `/battles/${battleId}/join`, { token: tok.student2 });
        rec('battles', 'second player joins → 2xx', join.status >= 200 && join.status < 300, `status=${join.status} ${join.status >= 300 ? JSON.stringify(join.json?.message).slice(0,100) : ''}`);

        // Anti-cheat: questions must NOT be fetchable before the battle starts.
        const q = await api('GET', `/battles/${battleId}/questions`, { token: tok.student });
        rec('battles', 'anti-cheat: questions blocked (403) while WAITING', q.status === 403, `status=${q.status}`);

        const lb = await api('GET', `/battles/${battleId}/leaderboard`, { token: tok.student });
        rec('battles', 'GET /battles/:id/leaderboard → 200', lb.status === 200, `status=${lb.status}`);

        // ── Gameplay: prove the converted correct-answer INDEX is actually right ──
        await api('POST', `/battles/${battleId}/lobby`, { token: tok.student });
        await api('POST', `/battles/${battleId}/ready`, { token: tok.student });
        await api('POST', `/battles/${battleId}/ready`, { token: tok.student2 });
        const start = await api('POST', `/battles/${battleId}/start`, { token: tok.student });
        rec('battles', 'start battle → 2xx (IN_PROGRESS)', start.status >= 200 && start.status < 300, `status=${start.status} ${start.status >= 300 ? JSON.stringify(start.json?.message).slice(0,90) : ''}`);

        if (start.status >= 200 && start.status < 300) {
          const bqs = await prisma.battleQuestion.findMany({ where: { battle_id: battleId }, orderBy: { order: 'asc' }, select: { id: true, correct_answer: true } }).catch(() => []);
          if (bqs[0]) {
            // Submit the STORED-correct option → must score correct (validates the
            // Question→pool→BattleQuestion correct-index mapping end to end).
            const good = await api('POST', '/battles/answer', { token: tok.student, body: { battle_id: battleId, question_id: bqs[0].id, selected_option: bqs[0].correct_answer, time_taken_ms: 1500 } });
            rec('battles', 'correct option scores is_correct=true', (good.status >= 200 && good.status < 300) && good.json?.data?.is_correct === true, `status=${good.status} is_correct=${good.json?.data?.is_correct}`);
          }
          if (bqs[1]) {
            const wrongIdx = (bqs[1].correct_answer + 1) % 4;
            const bad = await api('POST', '/battles/answer', { token: tok.student, body: { battle_id: battleId, question_id: bqs[1].id, selected_option: wrongIdx, time_taken_ms: 1500 } });
            rec('battles', 'wrong option scores is_correct=false', (bad.status >= 200 && bad.status < 300) && bad.json?.data?.is_correct === false, `status=${bad.status} is_correct=${bad.json?.data?.is_correct}`);
          }
        }

        // cleanup: cancel the battle to keep staging tidy
        await api('PATCH', `/battles/${battleId}/cancel`, { token: tok.student });
      }
    }
  }

  // ---------- ARTICLE WRITES (admin/moderator) + XSS SANITIZATION ----------
  if (!only || only === 'artwrite') {
    const adminUser = await prisma.user.findFirst({ where: { username: 'admin' }, select: { id: true } }).catch(() => null);
    const topic = await prisma.topic.findFirst({ select: { id: true } }).catch(() => null);
    if (!adminUser || !topic) {
      rec('artwrite', 'precondition: admin user + a topic exist', false, `admin=${!!adminUser} topic=${!!topic}`);
    } else {
      // Throwaway article to mutate safely.
      const art = await prisma.article.create({
        data: { title: 'QA Article', content: '<p>original</p>', author_id: adminUser.id, topic_id: topic.id, status: 'DRAFT' },
        select: { id: true },
      }).catch((e) => ({ err: e.message }));
      if (art.err || !art.id) {
        rec('artwrite', 'create throwaway article', false, art.err?.slice(0, 100));
      } else {
        const id = art.id;
        // Role gate: a student must NOT be able to change article status.
        const denied = await api('POST', '/articles/status', { token: tok.student, body: { articleId: id, status: 'PUBLISHED' } });
        rec('artwrite', 'student → POST /articles/status → 403', denied.status === 403, `status=${denied.status}`);

        // Admin approves (publishes) → persists. APPROVED is the real enum value.
        const pub = await api('POST', '/articles/status', { token: tok.admin, body: { articleId: id, status: 'APPROVED' } });
        const afterPub = await prisma.article.findUnique({ where: { id }, select: { status: true } });
        rec('artwrite', 'admin sets status APPROVED → persists', pub.status >= 200 && pub.status < 300 && afterPub?.status === 'APPROVED', `status=${pub.status} db=${afterPub?.status}`);

        // Moderator moderation action.
        const mod = await api('POST', `/articles/${id}/moderation`, { token: tok.moderator, body: { action: 'APPROVE', notes: 'looks good' } });
        rec('artwrite', 'moderator → moderation action → 2xx', mod.status >= 200 && mod.status < 300, `status=${mod.status} ${mod.status >= 300 ? JSON.stringify(mod.json?.message).slice(0,80) : ''}`);

        // XSS: content update must strip <script> but keep safe tags.
        const xss = '<script>alert(1)</script><p>safe content</p><img src=x onerror=alert(2)>';
        const upd = await api('POST', `/articles/${id}/update`, { token: tok.admin, body: { content: xss } });
        const afterUpd = await prisma.article.findUnique({ where: { id }, select: { content: true } });
        const c = afterUpd?.content ?? '';
        rec('artwrite', 'content update strips <script> + onerror (XSS sanitized)', upd.status >= 200 && upd.status < 300 && !/<script/i.test(c) && !/onerror/i.test(c), `status=${upd.status} hasScript=${/<script/i.test(c)} hasOnerror=${/onerror/i.test(c)}`);
        rec('artwrite', 'content update keeps safe markup', /safe content/.test(c), `kept=${/safe content/.test(c)}`);

        // cleanup
        await prisma.contentModeration.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.version.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.submissionLog.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.article.delete({ where: { id } }).catch(() => {});
      }
    }
  }

  // ---------- ROADMAP SOCIAL (bookmark + comments) ----------
  if (!only || only === 'social') {
    const list = await api('GET', '/roadmaps?limit=1', { token: tok.student });
    const arr0 = list.json?.data?.roadmaps || list.json?.data?.data || list.json?.data || [];
    const rm = (Array.isArray(arr0) ? arr0[0] : arr0?.roadmaps?.[0]);
    if (rm) {
      const bm = await api('POST', `/roadmaps/${rm.id}/bookmark`, { token: tok.student });
      rec('social', 'bookmark roadmap → 2xx', bm.status >= 200 && bm.status < 300, `status=${bm.status}`);

      const cmt = await api('POST', `/roadmaps/${rm.id}/comments`, { token: tok.student, body: { content: 'QA test comment' } });
      const commentId = cmt.json?.data?.id || cmt.json?.data?.comment?.id;
      rec('social', 'add comment → 2xx + id', cmt.status >= 200 && cmt.status < 300 && !!commentId, `status=${cmt.status} id=${commentId ? 'yes' : 'no'}`);

      const cmtBad = await api('POST', `/roadmaps/${rm.id}/comments`, { token: tok.student, body: {} });
      rec('social', 'comment without content → 4xx (validation)', cmtBad.status >= 400 && cmtBad.status < 500, `status=${cmtBad.status}`);

      if (commentId) {
        const like = await api('POST', `/roadmaps/${rm.id}/comments/${commentId}/like`, { token: tok.student });
        rec('social', 'toggle comment like → 2xx', like.status >= 200 && like.status < 300, `status=${like.status}`);
      }
      const get = await api('GET', `/roadmaps/${rm.id}/comments`, { token: tok.student });
      rec('social', 'GET comments → 200', get.status === 200, `status=${get.status}`);
    }
  }

  // ---------- CODE RUNNER + DRAFTS ----------
  if (!only || only === 'code') {
    // run-code hits Judge0 (external). Assert it responds gracefully (a result OR
    // a clean error), NOT a 500 crash/hang — env may lack network to Judge0.
    const run = await api('POST', '/run-code', { token: tok.student, body: { code: 'console.log(1+1)', language: 'javascript' } });
    rec('code', 'POST /run-code responds gracefully (not 5xx hang)', run.status > 0 && run.status < 500, `status=${run.status}`);

    // draft save + restore is DB-backed (no external dep).
    const list = await api('GET', '/challenges?limit=1', { token: tok.student });
    const cArr = list.json?.data?.challenges || list.json?.data?.data || (Array.isArray(list.json?.data) ? list.json.data : []);
    const ch = cArr?.[0];
    if (ch) {
      const save = await api('POST', '/run-code/draft', { token: tok.student, body: { challengeId: ch.id, code: 'const x = 42;', language: 'javascript' } });
      rec('code', 'save draft → 2xx', save.status >= 200 && save.status < 300, `status=${save.status} ${save.status >= 300 ? JSON.stringify(save.json?.message).slice(0,80) : ''}`);
      const got = await api('GET', `/run-code/draft/${ch.id}?language=javascript`, { token: tok.student });
      const code = got.json?.data?.code ?? got.json?.data?.draft?.code;
      rec('code', 'restore draft → 200 + same code', got.status === 200 && code === 'const x = 42;', `status=${got.status} match=${code === 'const x = 42;'}`);
      // missing language must not 500 (graceful null)
      const noLang = await api('GET', `/run-code/draft/${ch.id}`, { token: tok.student });
      rec('code', 'restore draft without language → graceful (not 5xx)', noLang.status < 500, `status=${noLang.status}`);
    }
  }

  // ---------- MODERATION QUEUE (moderator panel backend) ----------
  if (!only || only === 'mod') {
    const adminUser = await prisma.user.findFirst({ where: { username: 'admin' }, select: { id: true } }).catch(() => null);
    const topic = await prisma.topic.findFirst({ select: { id: true } }).catch(() => null);
    if (adminUser && topic) {
      const art = await prisma.article.create({ data: { title: 'QA Pending', content: '<p>p</p>', author_id: adminUser.id, topic_id: topic.id, status: 'PENDING' }, select: { id: true } }).catch(() => null);
      if (art?.id) {
        const id = art.id;
        const modQ = await api('GET', '/articles/moderation/queue', { token: tok.moderator });
        const arr = modQ.json?.data || [];
        rec('mod', 'moderator → moderation queue 200 + includes pending', modQ.status === 200 && Array.isArray(arr) && arr.some((a) => a.id === id), `status=${modQ.status} found=${Array.isArray(arr) && arr.some((a) => a.id === id)}`);

        const denied = await api('GET', '/articles/moderation/queue', { token: tok.student });
        rec('mod', 'student → moderation queue → 403', denied.status === 403, `status=${denied.status}`);

        // Leak fix: public /articles/all must NOT expose pending even with ?status=PENDING
        const pub = await api('GET', '/articles/all?status=PENDING', {});
        const pubArr = pub.json?.data || [];
        const leaked = Array.isArray(pubArr) && pubArr.some((a) => a.id === id || a.status === 'PENDING');
        rec('mod', 'public /articles/all cannot expose PENDING (leak fixed)', pub.status === 200 && !leaked, `status=${pub.status} leaked=${leaked}`);

        await prisma.article.delete({ where: { id } }).catch(() => {});
      }
    }
  }

  // ---------- ARTICLE SUBMISSION → MODERATION LOOP ----------
  if (!only || only === 'submit') {
    const topic = await prisma.topic.findFirst({ select: { id: true } }).catch(() => null);
    if (topic) {
      // student submits a new article
      const create = await api('POST', '/articles', { token: tok.student, body: { title: 'QA Submitted Article', content: '<p>real body</p><script>alert(1)</script>', topic_id: topic.id } });
      const id = create.json?.data?.id;
      const row = id ? await prisma.article.findUnique({ where: { id }, select: { status: true, content: true, author_id: true } }).catch(() => null) : null;
      rec('submit', 'student submits article → 2xx + PENDING row', create.status >= 200 && create.status < 300 && row?.status === 'PENDING', `status=${create.status} db=${row?.status}`);
      rec('submit', 'submitted content is XSS-sanitized', !!row && !/<script/i.test(row.content) && /real body/.test(row.content), `hasScript=${row ? /<script/i.test(row.content) : 'n/a'}`);

      const bad = await api('POST', '/articles', { token: tok.student, body: { content: 'x', topic_id: topic.id } });
      rec('submit', 'submit without title → 4xx (validation)', bad.status >= 400 && bad.status < 500, `status=${bad.status}`);

      const noAuth = await api('POST', '/articles', { body: { title: 'no auth', content: 'body here', topic_id: topic.id } });
      rec('submit', 'submit without auth → 401', noAuth.status === 401, `status=${noAuth.status}`);

      if (id) {
        // it shows up in the moderator queue, then moderator approves → APPROVED
        const q = await api('GET', '/articles/moderation/queue', { token: tok.moderator });
        const inQueue = Array.isArray(q.json?.data) && q.json.data.some((a) => a.id === id);
        rec('submit', 'submitted article appears in moderator queue', inQueue, `found=${inQueue}`);

        const appr = await api('POST', '/articles/status', { token: tok.moderator, body: { articleId: id, status: 'APPROVED' } });
        const after = await prisma.article.findUnique({ where: { id }, select: { status: true } }).catch(() => null);
        rec('submit', 'moderator approves → APPROVED (loop closed)', appr.status >= 200 && appr.status < 300 && after?.status === 'APPROVED', `status=${appr.status} db=${after?.status}`);

        await prisma.version.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.submissionLog.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.contentModeration.deleteMany({ where: { article_id: id } }).catch(() => {});
        await prisma.article.delete({ where: { id } }).catch(() => {});
      }
    }
  }

  // ---------- MORE FLOWS (leaderboard, progress, streak, edges) ----------
  if (!only || only === 'more') {
    const lb = await api('GET', '/leaderboard', { token: tok.student });
    rec('more', 'GET /leaderboard → 200', lb.status === 200, `status=${lb.status}`);

    const prog = await api('GET', '/users/progress', { token: tok.student });
    rec('more', 'GET /users/progress → 200', prog.status === 200, `status=${prog.status}`);

    const enrolled = await api('GET', '/users/roadmap', { token: tok.student });
    rec('more', 'GET /users/roadmap (enrolled list) → 200', enrolled.status === 200, `status=${enrolled.status}`);

    // streak update (rate-limited) → then stats reflects
    const su = await api('POST', '/streak/update', { token: tok.student, body: { activityType: 'TOPIC_COMPLETION', minutesSpent: 10, timezone: 'Asia/Kolkata' } });
    rec('more', 'POST /streak/update → 2xx', su.status >= 200 && su.status < 300, `status=${su.status} ${su.status >= 300 ? JSON.stringify(su.json?.message).slice(0, 80) : ''}`);
    const ss = await api('GET', '/streak/stats', { token: tok.student });
    rec('more', 'GET /streak/stats → 200 after update', ss.status === 200, `status=${ss.status}`);

    // enroll edge: non-existent roadmap must fail gracefully (4xx, not 500)
    const badEnroll = await api('POST', '/roadmaps/enroll', { token: tok.student, body: { roadmapId: '00000000-0000-0000-0000-000000000000' } });
    rec('more', 'enroll non-existent roadmap → graceful 4xx (not 500)', badEnroll.status >= 400 && badEnroll.status < 500, `status=${badEnroll.status}`);

    // challenge submit (hits Judge0 — assert graceful, env may lack network)
    const list = await api('GET', '/challenges?limit=1', { token: tok.student });
    const ch = (list.json?.data?.challenges || list.json?.data?.data || (Array.isArray(list.json?.data) ? list.json.data : []))?.[0];
    if (ch) {
      const sub = await api('POST', `/challenges/${ch.id}/submit`, { token: tok.student, body: { code: 'function solve(){return 1}', language: 'javascript' } });
      rec('more', 'POST /challenges/:id/submit responds gracefully (not 5xx hang)', sub.status > 0 && sub.status < 500, `status=${sub.status}`);
    }
  }

  // ---------- RESOURCE WRITES (create + save) ----------
  if (!only || only === 'resource') {
    const me = await api('GET', '/users/me', { token: tok.student });
    const userId = me.json?.data?.id;
    const create = await api('POST', '/resources/create', {
      token: tok.student,
      body: { title: 'QA Resource', content: 'body', type: 'article', description: 'd', url: 'https://example.com', category: 'frontend', difficulty: 'EASY', language: 'en' },
    });
    const id = create.json?.data?.id;
    const row = id ? await prisma.resource.findUnique({ where: { id }, select: { user_id: true, title: true } }).catch(() => null) : null;
    rec('resource', 'create resource → 2xx + DB row owned by user', create.status >= 200 && create.status < 300 && row?.user_id === userId, `status=${create.status} owned=${row?.user_id === userId}`);

    const badCreate = await api('POST', '/resources/create', { token: tok.student, body: { content: 'no title' } });
    rec('resource', 'create resource without title → 400 (validation)', badCreate.status === 400, `status=${badCreate.status}`);
    if (id) await prisma.resource.delete({ where: { id } }).catch(() => {});

    // NOTE: POST /resources/save/:id is mislabeled — it creates an Article using
    // :id as a topic_id (redundant with POST /articles). Test its real behavior
    // with a TOPIC id; non-topic ids 500 with an FK violation.
    const topic = await prisma.topic.findFirst({ select: { id: true } }).catch(() => null);
    if (topic) {
      const save = await api('POST', `/resources/save/${topic.id}`, { token: tok.student, body: { content: 'authored under topic' } });
      const artId = save.json?.data?.id;
      rec('resource', 'save/:topicId creates a PENDING article → 2xx', save.status >= 200 && save.status < 300 && !!artId, `status=${save.status}`);
      if (artId) {
        await prisma.version.deleteMany({ where: { article_id: artId } }).catch(() => {});
        await prisma.article.delete({ where: { id: artId } }).catch(() => {});
      }
    }
  }

  // ---------- DETAIL VIEWS (roadmap / resource / article detail + comments) ----------
  if (!only || only === 'detail') {
    // Roadmap detail + main-concepts sub-view
    const list = await api('GET', '/roadmaps?limit=1', { token: tok.student });
    const arr0 = list.json?.data?.roadmaps || list.json?.data?.data || list.json?.data || [];
    const rm = Array.isArray(arr0) ? arr0[0] : arr0?.roadmaps?.[0];
    if (rm?.id) {
      const d = await api('GET', `/roadmaps/${rm.id}`, { token: tok.student });
      const detailId = d.json?.data?.id || d.json?.data?.roadmap?.id;
      rec('detail', 'roadmap detail GET /roadmaps/:id → 200 + same id', d.status === 200 && detailId === rm.id, `status=${d.status} id=${detailId === rm.id}`);
      const mc = await api('GET', `/roadmaps/${rm.id}/main-concepts`, { token: tok.student });
      rec('detail', 'roadmap main-concepts sub-view → 200', mc.status === 200, `status=${mc.status}`);
    } else {
      rec('detail', 'roadmap detail (precondition: a roadmap exists)', false, 'no roadmap in DB');
    }

    // "Resource detail" in this app is a SUBJECT detail: the /resources/* routes
    // operate on Subjects (GET /resources/:id → getResource → subject + its
    // topics). The separately-created `Resource` rows (POST /resources/create)
    // are NOT what /resources/:id fetches — the frontend /resources/[id] page is
    // a subject detail (subject → topics → quiz). So assert with a real Subject id.
    const subject = await prisma.subject.findFirst({ select: { id: true } }).catch(() => null);
    if (subject) {
      const rd = await api('GET', `/resources/${subject.id}`, { token: tok.student });
      rec('detail', 'resource (subject) detail GET /resources/:id → 200', rd.status === 200, `status=${rd.status}`);
    } else {
      rec('detail', 'resource detail (precondition: a subject exists)', false, 'none');
    }

    // Article detail + comments (public read of an APPROVED article)
    const article = await prisma.article.findFirst({ where: { status: 'APPROVED' }, select: { id: true } }).catch(() => null);
    if (article) {
      const ad = await api('GET', `/articles/${article.id}`, {});
      rec('detail', 'article detail GET /articles/:id (public) → 200', ad.status === 200, `status=${ad.status}`);
      const ac = await api('GET', `/articles/${article.id}/comments`, {});
      rec('detail', 'article comments GET /articles/:id/comments → 200', ac.status === 200, `status=${ac.status}`);
    } else {
      rec('detail', 'article detail (precondition: an APPROVED article exists)', false, 'none in DB');
    }
  }

  // ---------- TOPIC QUIZ (submit + real computed score, persisted) ----------
  if (!only || only === 'quiz') {
    const quiz = await prisma.quiz
      .findFirst({ where: { questions: { some: {} } }, select: { id: true, passing_score: true, questions: { select: { id: true, correct_answer: true } } } })
      .catch(() => null);
    if (quiz?.questions?.length) {
      // Submit the real correct answers so scoring is exercised end to end.
      const answers = quiz.questions.map((q) => ({ question_id: q.id, answer: q.correct_answer }));
      // Regression: the route had no authMiddleware, so a valid student always
      // got 401 (controller reads req.user.id). Assert auth is enforced AND a
      // logged-in submit succeeds.
      const noAuth = await api('POST', '/quiz/submit', { body: { quiz_id: quiz.id, answers, time_spent: 5 } });
      rec('quiz', 'POST /quiz/submit without token → 401', noAuth.status === 401, `status=${noAuth.status}`);

      const sub = await api('POST', '/quiz/submit', { token: tok.student, body: { quiz_id: quiz.id, answers, time_spent: 5 } });
      const submission = sub.json?.data?.submission;
      const score = submission?.score;
      rec('quiz', 'submit topic quiz → 2xx + numeric score + boolean is_passed', sub.status >= 200 && sub.status < 300 && typeof score === 'number' && typeof submission?.is_passed === 'boolean', `status=${sub.status} score=${score} passed=${submission?.is_passed}`);
      // Correct answers must score above zero (real scoring, not a stub returning 0).
      rec('quiz', 'correct answers yield a positive score', typeof score === 'number' && score > 0, `score=${score}`);
      // The submission is durably persisted for the user with the same score.
      const row = submission?.id ? await prisma.quizSubmission.findUnique({ where: { id: submission.id }, select: { score: true } }).catch(() => null) : null;
      rec('quiz', 'submission persisted to DB with matching score', !!row && row.score === score, `db=${row ? row.score : 'none'}`);
      if (submission?.id) await prisma.quizSubmission.delete({ where: { id: submission.id } }).catch(() => {});
    } else {
      rec('quiz', 'quiz submit (precondition: a quiz with questions exists)', false, 'no quiz in DB');
    }
  }

  // ---------- ROLE ENFORCEMENT MATRIX (assert the DENY paths) ----------
  // The admin panel once "passed" render checks while every route 404'd. The
  // only assertion that catches a broken gate is the negative one: for each
  // privileged route, a STUDENT and an unauthenticated caller must be refused.
  if (!only || only === 'rbac') {
    const me = await api('GET', '/users/me', { token: tok.student });
    const studentId = me.json?.data?.id;
    const roleRow = await prisma.role.findFirst({ where: { name: 'STUDENT' }, select: { id: true } }).catch(() => null);

    // [method, path, body, allowed-roles]. Only DENY paths are exercised for
    // destructive verbs — we never fire a real DELETE as an admin.
    const ADMIN_ONLY = [
      ['GET', '/admin/dashboard/metrics'],
      ['GET', '/admin/roles'],
      ['GET', '/admin/users'],
      ['GET', '/admin/moderation/queue'],
      ['GET', '/admin/audit/logs'],
      ['GET', '/admin/config/general'],
      ['PATCH', `/admin/users/${studentId}/role`, { roleId: roleRow?.id }],
      ['DELETE', `/admin/users/${studentId}`],
      ['PATCH', '/admin/config', { category: 'general', key: 'k', value: 'v' }],
      ['POST', '/admin/reports/custom', { type: 'users' }],
      ['POST', '/admin/resources/allocate', { amount: 1 }],
      ['POST', '/rbac/roles', { name: 'QA_SHOULD_NOT_EXIST' }],
      ['POST', '/rbac/permissions', { name: 'QA_SHOULD_NOT_EXIST' }],
      ['GET', '/analytics/platform'],
      ['GET', '/analytics/report/engagement'],
    ];

    for (const [method, path, body] of ADMIN_ONLY) {
      const anon = await api(method, path, { body });
      rec('rbac', `${method} ${path} — no token → 401`, anon.status === 401, `status=${anon.status}`);

      const stu = await api(method, path, { token: tok.student, body });
      rec('rbac', `${method} ${path} — STUDENT → 403`, stu.status === 403, `status=${stu.status}`);

      const mod = await api(method, path, { token: tok.moderator, body });
      rec('rbac', `${method} ${path} — MODERATOR → 403 (admin-only)`, mod.status === 403, `status=${mod.status}`);
    }

    // ADMIN *or* MODERATOR routes: a student is still refused, a moderator is not.
    const article = await prisma.article.findFirst({ where: { status: 'APPROVED' }, select: { id: true } }).catch(() => null);
    const MOD_ROUTES = [
      ['GET', '/articles/moderation/queue'],
      ['POST', '/articles/status', { articleId: article?.id, status: 'APPROVED' }],
      ['POST', `/articles/${article?.id}/moderation`, { action: 'APPROVE', notes: 'qa' }],
      ['POST', `/articles/${article?.id}/update`, { content: '<p>qa</p>' }],
    ];
    for (const [method, path, body] of MOD_ROUTES) {
      const anon = await api(method, path, { body });
      rec('rbac', `${method} ${path} — no token → 401`, anon.status === 401, `status=${anon.status}`);
      const stu = await api(method, path, { token: tok.student, body });
      rec('rbac', `${method} ${path} — STUDENT → 403`, stu.status === 403, `status=${stu.status}`);
      const mod = await api(method, path, { token: tok.moderator, body });
      rec('rbac', `${method} ${path} — MODERATOR allowed (not 401/403)`, mod.status !== 401 && mod.status !== 403, `status=${mod.status}`);
    }

    // The admin's own happy path on the read-only admin surface must still work,
    // otherwise a blanket 403 would make every DENY assertion above vacuous.
    for (const path of ['/admin/dashboard/metrics', '/admin/roles', '/admin/users', '/admin/moderation/queue', '/admin/audit/logs']) {
      const r = await api('GET', path, { token: tok.admin });
      rec('rbac', `GET ${path} — ADMIN → 200 (gate is not a blanket deny)`, r.status === 200, `status=${r.status}`);
    }

    // Privilege escalation: a student must not be able to hand themselves ADMIN.
    const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' }, select: { id: true } }).catch(() => null);
    if (adminRole && studentId) {
      await api('PATCH', `/admin/users/${studentId}/role`, { token: tok.student, body: { roleId: adminRole.id } });
      await api('POST', '/rbac/users/role', { token: tok.student, body: { userId: studentId, roleId: adminRole.id } });
      const stillStudent = await prisma.user.findUnique({ where: { id: studentId }, include: { role: true } }).catch(() => null);
      rec('rbac', 'student cannot self-escalate to ADMIN (DB role unchanged)', stillStudent?.role?.name === 'STUDENT', `role=${stillStudent?.role?.name}`);
    }
  }

  // ---------- OWNERSHIP / IDOR (horizontal privilege) ----------
  if (!only || only === 'idor') {
    const me = await api('GET', '/users/me', { token: tok.student });
    const studentId = me.json?.data?.id;
    const adminRow = await prisma.user.findFirst({ where: { username: 'admin' }, select: { id: true } }).catch(() => null);

    // Reading ANOTHER user's analytics must be refused. The route sits behind
    // authMiddleware only — no role gate, no `req.user.id === :userId` check.
    if (adminRow) {
      const other = await api('GET', `/analytics/user/${adminRow.id}`, { token: tok.student });
      rec('idor', 'student cannot read another user\'s analytics (GET /analytics/user/:id)', other.status === 403 || other.status === 404, `status=${other.status}`);
      const self = await api('GET', `/analytics/user/${studentId}`, { token: tok.student });
      rec('idor', 'student CAN read their own analytics (guard is not a blanket deny)', self.status === 200, `status=${self.status}`);
      const asAdmin = await api('GET', `/analytics/user/${studentId}`, { token: tok.admin });
      rec('idor', 'admin can read any user\'s analytics', asAdmin.status === 200, `status=${asAdmin.status}`);
    }

    // A roadmap owned by someone else must not be editable.
    const foreign = await prisma.roadmap.findFirst({ where: { user_id: { not: studentId } }, select: { id: true, title: true, description: true } }).catch(() => null);
    if (foreign) {
      const upd = await api('PUT', `/roadmaps/${foreign.id}`, { token: tok.student, body: { title: foreign.title, description: 'HIJACKED', difficulty: 'BEGINNER' } });
      const after = await prisma.roadmap.findUnique({ where: { id: foreign.id }, select: { description: true } });
      rec('idor', 'student cannot edit a roadmap they do not own', upd.status === 403 && after?.description !== 'HIJACKED', `status=${upd.status} desc_changed=${after?.description === 'HIJACKED'}`);
    }

    // A battle you never joined must not leak its questions or accept answers.
    const qrow = await prisma.question.findFirst({ where: { quiz: { topic_id: { not: null } } }, select: { quiz: { select: { topic_id: true } } } }).catch(() => null);
    const topicId = qrow?.quiz?.topic_id;
    if (topicId) {
      const create = await api('POST', '/battles', {
        token: tok.student,
        body: { title: 'QA IDOR ' + Date.now(), difficulty: 'EASY', type: 'QUICK', max_participants: 4, total_questions: 5, question_source: { type: 'topic', id: topicId, count: 5 } },
      });
      const bId = create.json?.data?.id;
      if (bId) {
        await api('POST', `/battles/${bId}/join`, { token: tok.student });
        await api('POST', `/battles/${bId}/lobby`, { token: tok.student });
        await api('POST', `/battles/${bId}/ready`, { token: tok.student });
        const start = await api('POST', `/battles/${bId}/start`, { token: tok.student });

        // student2 never joined this battle.
        const peek = await api('GET', `/battles/${bId}/questions`, { token: tok.student2 });
        rec('idor', 'non-participant cannot read an in-progress battle\'s questions', peek.status === 403 || peek.status === 404, `status=${peek.status} (start=${start.status})`);

        const bq = await prisma.battleQuestion.findFirst({ where: { battle_id: bId }, orderBy: { order: 'asc' }, select: { id: true, correct_answer: true } }).catch(() => null);
        if (bq) {
          const ans = await api('POST', '/battles/answer', { token: tok.student2, body: { battle_id: bId, question_id: bq.id, selected_option: bq.correct_answer, time_taken_ms: 900 } });
          const stored = await prisma.battleAnswer.count({ where: { question_id: bq.id } });
          rec('idor', 'non-participant cannot submit an answer to a battle they never joined', ans.status >= 400 && stored === 0, `status=${ans.status} rows=${stored}`);
        }
        await api('PATCH', `/battles/${bId}/cancel`, { token: tok.student });
        await prisma.battle.delete({ where: { id: bId } }).catch(() => {});
      }
    }
  }

  // ---------- CONCURRENCY GUARANTEES ----------
  // A battle is the one place in this app where two humans race on the same
  // row. These assert the invariants at the DB, not just the HTTP status.
  if (!only || only === 'concurrency') {
    const qrow = await prisma.question.findFirst({ where: { quiz: { topic_id: { not: null } } }, select: { quiz: { select: { topic_id: true } } } }).catch(() => null);
    const topicId = qrow?.quiz?.topic_id;
    if (!topicId) {
      rec('concurrency', 'precondition: a topic with questions exists', false, 'none');
    } else {
      const create = await api('POST', '/battles', {
        token: tok.student,
        body: { title: 'QA Concurrency ' + Date.now(), difficulty: 'EASY', type: 'QUICK', max_participants: 4, total_questions: 5, question_source: { type: 'topic', id: topicId, count: 5 } },
      });
      const bId = create.json?.data?.id;
      if (!bId) {
        rec('concurrency', 'precondition: battle created', false, `status=${create.status}`);
      } else {
        // Two players join AT THE SAME TIME — no duplicate participant rows.
        const joins = await Promise.all([
          api('POST', `/battles/${bId}/join`, { token: tok.student }),
          api('POST', `/battles/${bId}/join`, { token: tok.student }),
          api('POST', `/battles/${bId}/join`, { token: tok.student2 }),
          api('POST', `/battles/${bId}/join`, { token: tok.student2 }),
        ]);
        const participants = await prisma.battleParticipant.count({ where: { battle_id: bId } });
        rec('concurrency', 'concurrent duplicate joins → exactly 2 participant rows', participants === 2, `rows=${participants} statuses=${joins.map((j) => j.status).join(',')}`);

        const battleAfterJoin = await prisma.battle.findUnique({ where: { id: bId }, select: { current_participants: true } });
        rec('concurrency', 'current_participants counter matches the real row count', battleAfterJoin?.current_participants === participants, `counter=${battleAfterJoin?.current_participants} rows=${participants}`);

        await api('POST', `/battles/${bId}/lobby`, { token: tok.student });
        await Promise.all([
          api('POST', `/battles/${bId}/ready`, { token: tok.student }),
          api('POST', `/battles/${bId}/ready`, { token: tok.student2 }),
        ]);

        // TWO CLIENTS START THE SAME BATTLE AT ONCE — exactly one must win, and
        // the questions must not be dealt twice.
        const bqBefore = await prisma.battleQuestion.count({ where: { battle_id: bId } });
        const starts = await Promise.all([
          api('POST', `/battles/${bId}/start`, { token: tok.student }),
          api('POST', `/battles/${bId}/start`, { token: tok.student }),
        ]);
        const ok = starts.filter((s) => s.status >= 200 && s.status < 300).length;
        const server5xx = starts.filter((s) => s.status >= 500).length;
        const bqAfter = await prisma.battleQuestion.count({ where: { battle_id: bId } });
        const state = await prisma.battle.findUnique({ where: { id: bId }, select: { status: true, start_time: true } });
        rec('concurrency', 'two concurrent starts → no 5xx (redlock serialises them)', server5xx === 0, `statuses=${starts.map((s) => s.status).join(',')}`);
        rec('concurrency', 'two concurrent starts → battle ends up IN_PROGRESS exactly once', state?.status === 'IN_PROGRESS' && ok >= 1, `status=${state?.status} ok=${ok}`);
        rec('concurrency', 'two concurrent starts do NOT duplicate the question set', bqAfter === bqBefore, `before=${bqBefore} after=${bqAfter}`);

        const bqs = await prisma.battleQuestion.findMany({ where: { battle_id: bId }, orderBy: { order: 'asc' }, select: { id: true, correct_answer: true, points: true } });
        if (bqs[0] && state?.status === 'IN_PROGRESS') {
          // DUPLICATE submitAnswer, fired in parallel: one row, one score.
          const q0 = bqs[0];
          const dup = await Promise.all([
            api('POST', '/battles/answer', { token: tok.student, body: { battle_id: bId, question_id: q0.id, selected_option: q0.correct_answer, time_taken_ms: 1000 } }),
            api('POST', '/battles/answer', { token: tok.student, body: { battle_id: bId, question_id: q0.id, selected_option: q0.correct_answer, time_taken_ms: 1000 } }),
            api('POST', '/battles/answer', { token: tok.student, body: { battle_id: bId, question_id: q0.id, selected_option: q0.correct_answer, time_taken_ms: 1000 } }),
          ]);
          const rows = await prisma.battleAnswer.count({ where: { question_id: q0.id, user_id: (await api('GET', '/users/me', { token: tok.student })).json?.data?.id } });
          rec('concurrency', 'triple-fired duplicate submitAnswer → exactly 1 BattleAnswer row', rows === 1, `rows=${rows} statuses=${dup.map((d) => d.status).join(',')}`);
          rec('concurrency', 'duplicate submitAnswer never 5xx (unique violation handled)', dup.every((d) => d.status < 500), `statuses=${dup.map((d) => d.status).join(',')}`);

          const meId = (await api('GET', '/users/me', { token: tok.student })).json?.data?.id;
          const part = await prisma.battleParticipant.findFirst({ where: { battle_id: bId, user_id: meId }, select: { score: true, correct_count: true } });
          rec('concurrency', 'score counted ONCE for a triple-submitted question', part?.correct_count === 1, `correct_count=${part?.correct_count} score=${part?.score}`);
        }

        // Leaderboard under load: the build once nested a transaction inside a
        // transaction and deadlocked on a small pool. Hammer it in parallel.
        const lbs = await Promise.all(Array.from({ length: 12 }, () => api('GET', `/battles/${bId}/leaderboard`, { token: tok.student })));
        rec('concurrency', '12 parallel leaderboard builds → no 5xx / no pool deadlock', lbs.every((l) => l.status === 200), `statuses=${[...new Set(lbs.map((l) => l.status))].join(',')}`);

        // Play the battle out. There is no explicit "complete" endpoint — the
        // battle ends itself once every participant has answered every question
        // (battleSocket.handleAnswerSubmitted → checkAllParticipantsDone).
        for (const bq of bqs) {
          await api('POST', '/battles/answer', { token: tok.student, body: { battle_id: bId, question_id: bq.id, selected_option: bq.correct_answer, time_taken_ms: 800 } });
          await api('POST', '/battles/answer', { token: tok.student2, body: { battle_id: bId, question_id: bq.id, selected_option: (bq.correct_answer + 1) % 4, time_taken_ms: 900 } });
        }
        let finalBattle = null;
        for (let i = 0; i < 20; i++) {
          finalBattle = await prisma.battle.findUnique({ where: { id: bId }, select: { status: true, winner_id: true } });
          if (finalBattle?.status === 'COMPLETED') break;
          await new Promise((r) => setTimeout(r, 300));
        }
        const lbRows = await prisma.battleLeaderboard.findMany({ where: { battle_id: bId }, orderBy: { rank: 'asc' }, select: { rank: true, score: true } });
        rec('concurrency', 'battle auto-completes once every participant has answered', finalBattle?.status === 'COMPLETED', `status=${finalBattle?.status}`);
        rec('concurrency', 'final leaderboard persisted with one row per participant', lbRows.length === participants, `rows=${lbRows.length} participants=${participants}`);
        rec('concurrency', 'final leaderboard ranks are 1..n, sorted by score desc', lbRows.length > 0 && lbRows.every((r, i) => r.rank === i + 1) && lbRows.every((r, i) => i === 0 || lbRows[i - 1].score >= r.score), `ranks=${lbRows.map((r) => `${r.rank}:${r.score}`).join(' ')}`);
        rec('concurrency', 'a completed battle has a winner recorded', !!finalBattle?.winner_id, `winner=${finalBattle?.winner_id ? 'set' : 'null'}`);

        await prisma.battle.delete({ where: { id: bId } }).catch(() => {});
      }
    }
  }

  // ---------- RATE LIMITING ----------
  if (!only || only === 'ratelimit') {
    // POST /streak/update is capped at 10/min. Fire a burst and require the
    // limiter to actually bite (429), not silently pass everything through.
    const burst = await Promise.all(
      Array.from({ length: 16 }, () => api('POST', '/streak/update', { token: tok.student, body: { activityType: 'TOPIC_COMPLETION', minutesSpent: 1, timezone: 'Asia/Kolkata' } }))
    );
    const throttled = burst.filter((b) => b.status === 429).length;
    rec('ratelimit', 'burst of 16 streak updates trips the 10/min limiter (429s seen)', throttled > 0, `429s=${throttled}/16`);
    rec('ratelimit', 'rate limiter returns 429, never 5xx', burst.every((b) => b.status < 500), `statuses=${[...new Set(burst.map((b) => b.status))].join(',')}`);

    // Every limiter must own its Redis bucket. They all defaulted to the same
    // `rate-limit:<ip>` key, so unrelated traffic spent each other's budget and
    // each call rewrote the TTL with its own window. The streak burst above
    // already pushed the shared counter past 16; the dashboard limiter allows
    // 20/min, so 10 more dashboard calls must all succeed if — and only if —
    // the buckets are separate.
    const dashCalls = [];
    for (let i = 0; i < 10; i++) dashCalls.push(await api('GET', '/dashboard/summary', { token: tok.student }));
    rec('ratelimit', 'dashboard has its own bucket (10 calls after a 16-request streak burst all pass)', dashCalls.every((d) => d.status === 200), `statuses=${[...new Set(dashCalls.map((d) => d.status))].join(',')}`);
  }

  // ---------- STORED-XSS WRITE PATHS ----------
  // Article content is rendered with dangerouslySetInnerHTML on the frontend and
  // the client-side DOMPurify is a no-op during SSR, so the ONLY thing standing
  // between a payload and execution is server-side sanitisation on write. Every
  // write path that can reach Article.content / Resource.content is asserted.
  if (!only || only === 'xss') {
    const PAYLOAD = '<img src=x onerror="window.__XSS=1"><script>window.__XSS=1</script><p>legit body</p>';
    const topic = await prisma.topic.findFirst({ select: { id: true } }).catch(() => null);
    const clean = (s) => !/<script/i.test(s || '') && !/onerror/i.test(s || '');

    if (topic) {
      // POST /resources/save/:topicId — creates an Article. Previously the ONLY
      // article write path with no sanitisation.
      const save = await api('POST', `/resources/save/${topic.id}`, { token: tok.student, body: { content: PAYLOAD } });
      const savedId = save.json?.data?.id;
      const savedRow = savedId ? await prisma.article.findUnique({ where: { id: savedId }, select: { content: true } }) : null;
      rec('xss', 'POST /resources/save/:topicId sanitises article content', save.status < 300 && clean(savedRow?.content), `status=${save.status} stored=${JSON.stringify(savedRow?.content || '').slice(0, 80)}`);
      rec('xss', 'POST /resources/save/:topicId keeps the safe markup', /legit body/.test(savedRow?.content || ''), `kept=${/legit body/.test(savedRow?.content || '')}`);
      if (savedId) {
        await prisma.version.deleteMany({ where: { article_id: savedId } }).catch(() => {});
        await prisma.article.delete({ where: { id: savedId } }).catch(() => {});
      }
    }

    // POST /resources/create — Resource.content is rendered the same way.
    const rc = await api('POST', '/resources/create', {
      token: tok.student,
      body: { title: `QA XSS ${PAYLOAD}`, content: PAYLOAD, type: 'article', description: PAYLOAD, url: 'https://example.com', category: 'frontend', difficulty: 'EASY', language: 'en' },
    });
    const resId = rc.json?.data?.id;
    const resRow = resId ? await prisma.resource.findUnique({ where: { id: resId }, select: { title: true, content: true, description: true } }) : null;
    rec('xss', 'POST /resources/create sanitises resource content', rc.status < 300 && clean(resRow?.content), `status=${rc.status} stored=${JSON.stringify(resRow?.content || '').slice(0, 80)}`);
    rec('xss', 'POST /resources/create strips tags from the plain-text title', clean(resRow?.title) && !/</.test(resRow?.title || ''), `title=${JSON.stringify(resRow?.title || '')}`);
    if (resId) await prisma.resource.delete({ where: { id: resId } }).catch(() => {});

    // Regression guard on the paths that were already sanitised.
    if (topic) {
      const art = await api('POST', '/articles', { token: tok.student, body: { title: `QA XSS ${PAYLOAD}`, content: PAYLOAD, topic_id: topic.id } });
      const artId = art.json?.data?.id;
      const artRow = artId ? await prisma.article.findUnique({ where: { id: artId }, select: { title: true, content: true } }) : null;
      rec('xss', 'POST /articles still sanitises (regression)', clean(artRow?.content) && clean(artRow?.title), `content_clean=${clean(artRow?.content)} title_clean=${clean(artRow?.title)}`);
      if (artId) {
        await prisma.version.deleteMany({ where: { article_id: artId } }).catch(() => {});
        await prisma.submissionLog.deleteMany({ where: { article_id: artId } }).catch(() => {});
        await prisma.article.delete({ where: { id: artId } }).catch(() => {});
      }
    }
  }

  // ---------- CODE EXECUTION SURFACE ----------
  if (!only || only === 'exec') {
    // Judge0 costs money per call. An unauthenticated execution endpoint is a
    // free compute faucet for anyone who finds it.
    const anon = await api('POST', '/run-code', { body: { code: 'console.log(1)', language: 'javascript' } });
    rec('exec', 'POST /run-code requires authentication', anon.status === 401, `status=${anon.status}`);

    const authed = await api('POST', '/run-code', { token: tok.student, body: { code: 'console.log(1)', language: 'javascript' } });
    rec('exec', 'POST /run-code works for an authenticated user (guard is not a blanket deny)', authed.status === 200, `status=${authed.status}`);

    // An unknown language must be rejected up front, not forwarded to Judge0.
    const badLang = await api('POST', '/run-code', { token: tok.student, body: { code: 'x', language: 'brainfuck' } });
    rec('exec', 'unsupported language → 4xx (never a 5xx or a paid Judge0 call)', badLang.status >= 400 && badLang.status < 500, `status=${badLang.status}`);

    // When the executor is unreachable the request must still resolve — the
    // opossum breaker is what stops a Judge0 outage becoming a 15s hang per
    // test case. Assert the endpoint answers well inside that ceiling.
    const t0 = Date.now();
    const r = await api('POST', '/run-code', { token: tok.student, body: { code: 'console.log(1)', language: 'javascript' } });
    const ms = Date.now() - t0;
    rec('exec', 'run-code answers within 20s even when the executor is degraded', r.status < 500 && ms < 20000, `status=${r.status} ms=${ms}`);
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
