// QA areas — Authentication, authorization, role matrix, IDOR and rate limits.
import { api, prisma, rec, sb, USERS } from '../lib.mjs';

// ---------- AUTH & AUTHORIZATION ----------
export async function auth({ tok }) {
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
export async function authz({ tok }) {
  // These routes are gated authorizeRoles('admin') (lowercase) while real role is 'ADMIN'.
  // EXPECTED (after fix): admin gets through (200/!403). Currently asserts the bug if 403.
  const ra = await api('GET', '/analytics/platform', { token: tok.admin }).catch(() => ({ status: 0 }));
  rec('authz', "admin → GET /analytics/platform not falsely 403 (lowercase-role case bug)", ra.status !== 403, `status=${ra.status}`);
  // a student must still be denied
  const rs = await api('GET', '/analytics/platform', { token: tok.student }).catch(() => ({ status: 0 }));
  rec('authz', 'student → GET /analytics/platform → 403', rs.status === 403, `status=${rs.status}`);
}

// ---------- DASHBOARD ----------
export async function dashboard({ tok }) {
  const r = await api('GET', '/dashboard/summary', { token: tok.student });
  const d = r.json?.data;
  rec('dashboard', 'GET /dashboard/summary (student) → 200 + shape', r.status === 200 && !!d && ('stats' in d || 'enrolledRoadmaps' in d || 'streak' in d), `status=${r.status} keys=${d ? Object.keys(d).join(',') : 'none'}`);

  // admin metrics system health — cacheStatus was hardcoded-broken (always 'error')
  const m = await api('GET', '/admin/dashboard/metrics', { token: tok.admin });
  const cache = m.json?.data?.systemHealth?.cacheStatus;
  rec('dashboard', "admin metrics cacheStatus = 'healthy' (real probe, was always error)", m.status === 200 && cache === 'healthy', `status=${m.status} cache=${cache}`);
}

// ---------- ROLE ENFORCEMENT MATRIX (assert the DENY paths) ----------
// The admin panel once "passed" render checks while every route 404'd. The
// only assertion that catches a broken gate is the negative one: for each
// privileged route, a STUDENT and an unauthenticated caller must be refused.
export async function rbac({ tok }) {
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
export async function idor({ tok }) {
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

// ---------- RATE LIMITING ----------
export async function ratelimit({ tok }) {
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
