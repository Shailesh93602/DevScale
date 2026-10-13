// QA areas — Roadmaps, profile, content reads/writes, quizzes.
import { api, prisma, rec } from '../lib.mjs';

// ---------- ROADMAPS ----------
export async function roadmaps({ tok }) {
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
export async function profile({ tok }) {
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
export async function content({ tok }) {
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

// ---------- ROADMAP SOCIAL (bookmark + comments) ----------
export async function social({ tok }) {
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

// ---------- MORE FLOWS (leaderboard, progress, streak, edges) ----------
export async function more({ tok }) {
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
export async function resource({ tok }) {
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
export async function detail({ tok }) {
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
export async function quiz({ tok }) {
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
