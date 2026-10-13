// QA areas — Article writes, moderation, submission loop and stored XSS.
import { api, prisma, rec } from '../lib.mjs';

// ---------- ARTICLE WRITES (admin/moderator) + XSS SANITIZATION ----------
export async function artwrite({ tok }) {
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

// ---------- MODERATION QUEUE (moderator panel backend) ----------
export async function mod({ tok }) {
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
export async function submit({ tok }) {
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

// ---------- STORED-XSS WRITE PATHS ----------
// Article content is rendered with dangerouslySetInnerHTML on the frontend and
// the client-side DOMPurify is a no-op during SSR, so the ONLY thing standing
// between a payload and execution is server-side sanitisation on write. Every
// write path that can reach Article.content / Resource.content is asserted.
export async function xss({ tok }) {
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
