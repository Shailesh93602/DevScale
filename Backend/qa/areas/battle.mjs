// QA areas — Coding challenges, battle lifecycle, concurrency and code execution.
import { api, prisma, rec } from '../lib.mjs';

// ---------- CODING CHALLENGES ----------
export async function challenges({ tok }) {
  const list = await api('GET', '/challenges?page=1&limit=5', { token: tok.student });
  const arr = list.json?.data?.challenges || list.json?.data?.data || (Array.isArray(list.json?.data) ? list.json.data : []);
  rec('challenges', 'GET /challenges → 200', list.status === 200, `status=${list.status} count=${arr?.length ?? '?'}`);
  if (arr && arr[0]) {
    const det = await api('GET', `/challenges/${arr[0].id}`, { token: tok.student });
    rec('challenges', 'GET /challenges/:id → 200', det.status === 200, `status=${det.status}`);
  }
}

// ---------- BATTLE ZONE (REST lifecycle) ----------
export async function battles({ tok }) {
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

// ---------- CODE RUNNER + DRAFTS ----------
export async function code({ tok }) {
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

// ---------- CONCURRENCY GUARANTEES ----------
// A battle is the one place in this app where two humans race on the same
// row. These assert the invariants at the DB, not just the HTTP status.
export async function concurrency({ tok }) {
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

// ---------- CODE EXECUTION SURFACE ----------
export async function exec({ tok }) {
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
