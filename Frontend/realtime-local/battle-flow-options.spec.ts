import { expect, test } from '@playwright/test';
import {
  FLOW_OPTIONS,
  answer,
  eventsNamed,
  openDb,
  expectNoReloadWorkaround,
  queueOnFirstLoad,
  signIn,
  waitForEvent,
  wrongOf,
  type PgClient,
  type Player,
  type QuestionRow,
} from './realtimeHelpers';

// BATTLE_EARLY_ADVANCE=1 and MATCHMAKING_AUTO_START=1 on the realtime host.
// Run with RT_FLOW_OPTIONS=1 Backend/qa/realtime/run-local-proof.sh.
let db: PgClient;
let a: Player;
let b: Player;
let battleId: string;
let questions: QuestionRow[] = [];

const questionAt = (p: Player, index: number) =>
  eventsNamed(p, 'battle:question').find((e) => e.data.index === index)!;

test.describe.serial('battle flow options on the realtime host', () => {
  test.skip(!FLOW_OPTIONS, 'needs RT_FLOW_OPTIONS=1 (flags on)');

  test.beforeAll(async ({ browser }) => {
    db = await openDb();
    a = await signIn(browser, 'Alpha');
    b = await signIn(browser, 'Bravo');
  });

  test.afterAll(async () => {
    await a?.context.close();
    await b?.context.close();
    await db?.end();
  });

  test('a match is readied and auto-started with no lobby clicks', async () => {
    // Both are brand new and queue on their very first page load.
    await queueOnFirstLoad(db, a, { waiter: true });
    await queueOnFirstLoad(db, b, { waiter: false });

    // A was waiting: only the socket can tell it about the match.
    await waitForEvent(a, 'matchmaking:matched');
    for (const p of [a, b]) await expectNoReloadWorkaround(p);
    battleId = String(eventsNamed(a, 'matchmaking:matched')[0].data.battleId);

    // Readied before the waiter was told, so this is already true now.
    const seats = await db.query<{ status: string }>(
      'select status from "BattleParticipant" where battle_id = $1',
      [battleId],
    );
    expect(seats.rows.map((r) => r.status)).toEqual(['READY', 'READY']);
    const battle = await db.query<{ status: string }>(
      'select status from "Battle" where id = $1',
      [battleId],
    );
    expect(['LOBBY', 'IN_PROGRESS']).toContain(battle.rows[0].status);

    for (const p of [a, b]) {
      await p.page.getByRole('button', { name: /enter arena/i }).click();
      await p.page.waitForURL(`**/battle-zone/${battleId}`);
    }
    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:started', undefined, 30_000);
      await waitForEvent(p, 'battle:question', (d) => d.index === 0);
    }
    const st = await db.query<{ status: string }>(
      'select status from "Battle" where id = $1',
      [battleId],
    );
    expect(st.rows[0].status).toBe('IN_PROGRESS');
    const playing = await db.query<{ status: string }>(
      'select status from "BattleParticipant" where battle_id = $1',
      [battleId],
    );
    expect(playing.rows.map((r) => r.status)).toEqual(['PLAYING', 'PLAYING']);

    const manual = [...a.requests, ...b.requests].filter(
      (r) =>
        r.method !== 'GET' &&
        /\/battles\/[^/]+\/(ready|start|lobby)/.test(r.url),
    );
    expect(manual).toEqual([]);

    const rows = await db.query<QuestionRow>(
      'select id, "order", question, correct_answer, time_limit from "BattleQuestion" where battle_id = $1 order by "order"',
      [battleId],
    );
    questions = rows.rows;
    expect(questions).toHaveLength(5);
  });

  test('answering together advances early, exactly once', async () => {
    const q = questions[0];
    await Promise.all([
      answer(a, q, q.correct_answer),
      answer(b, q, wrongOf(q)),
    ]);
    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:question', (d) => d.index === 1, 15_000);
    }
    const elapsed = questionAt(a, 1).at - questionAt(a, 0).at;
    expect(elapsed).toBeLessThan(q.time_limit * 1000);
    await a.page.waitForTimeout(3_000);
    for (const p of [a, b]) {
      const ones = eventsNamed(p, 'battle:question').filter(
        (e) => e.data.index === 1,
      );
      expect(ones).toHaveLength(1);
      expect(
        eventsNamed(p, 'battle:question').some((e) => e.data.index === 2),
      ).toBe(false);
    }
  });

  test('one player answering is not enough: the timer still runs', async () => {
    const q = questions[1];
    await answer(a, q, q.correct_answer);
    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:question', (d) => d.index === 2, 45_000);
    }
    const elapsed = questionAt(a, 2).at - questionAt(a, 1).at;
    expect(elapsed).toBeGreaterThanOrEqual(q.time_limit * 1000);
    const answered = await db.query<{ n: number }>(
      'select count(*)::int as n from "BattleAnswer" where question_id = $1',
      [q.id],
    );
    expect(answered.rows[0].n).toBe(1);
  });

  test('the rest advance early and the battle completes once', async () => {
    for (const q of questions.slice(2)) {
      const index = q.order - 1;
      for (const p of [a, b]) {
        await waitForEvent(p, 'battle:question', (d) => d.index === index);
      }
      await Promise.all([
        answer(a, q, q.correct_answer),
        answer(b, q, wrongOf(q)),
      ]);
    }
    for (const p of [a, b]) await waitForEvent(p, 'battle:completed');

    const battle = await db.query<{ status: string; winner_id: string | null }>(
      'select status, winner_id from "Battle" where id = $1',
      [battleId],
    );
    expect(battle.rows[0]).toEqual({
      status: 'COMPLETED',
      winner_id: a.dbUserId,
    });

    // Early advance cut every question but Q2 short of its 30 s.
    const total = questionAt(a, 4).at - questionAt(a, 0).at;
    expect(total).toBeLessThan(questions[0].time_limit * 1000 * 2);

    await a.page.waitForTimeout(3_000);
    const ratings = await db.query<{
      user_id: string;
      games_played: number;
      wins: number;
    }>(
      'select user_id, games_played, wins from "UserRating" where user_id = any($1)',
      [[a.dbUserId, b.dbUserId]],
    );
    expect(ratings.rows.find((r) => r.user_id === a.dbUserId)).toMatchObject({
      games_played: 1,
      wins: 1,
    });
    expect(ratings.rows.find((r) => r.user_id === b.dbUserId)).toMatchObject({
      games_played: 1,
      wins: 0,
    });

    for (const p of [a, b]) {
      expect(p.failures).toEqual([]);
      expect(eventsNamed(p, 'battle:completed')).toHaveLength(1);
      const indexes = eventsNamed(p, 'battle:question').map(
        (e) => e.data.index,
      );
      expect(indexes).toEqual([0, 1, 2, 3, 4]);
    }
  });
});
