import { expect, test } from '@playwright/test';
import {
  FLOW_OPTIONS,
  REALTIME_HOST,
  REST_HOST,
  answer,
  eventsNamed,
  openDb,
  openInstantBattle,
  signIn,
  waitForEvent,
  wrongOf,
  type PgClient,
  type Player,
  type QuestionRow,
} from './realtimeHelpers';

// Default flags (BATTLE_EARLY_ADVANCE / MATCHMAKING_AUTO_START off).
// See Backend/docs/REALTIME_HOSTING.md.
let db: PgClient;
let a: Player;
let b: Player;
let battleId: string;
let creator: Player;
let other: Player;

let questions: QuestionRow[] = [];

test.describe.serial('realtime battle on the long-lived host', () => {
  test.skip(FLOW_OPTIONS, 'flags-on run: battle-flow-options.spec.ts');

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

  test('matchmaking pairs the two players over the realtime host', async () => {
    for (const p of [a, b]) await openInstantBattle(db, p);

    await a.page.getByRole('button', { name: /find instant match/i }).click();
    await expect(a.page.getByText(/cancel queue/i)).toBeVisible();
    await b.page.getByRole('button', { name: /find instant match/i }).click();

    // A was waiting: only the socket can tell it about the match.
    await waitForEvent(a, 'matchmaking:matched');
    battleId = String(eventsNamed(a, 'matchmaking:matched')[0].data.battleId);

    const battle = await db.query<{
      user_id: string;
      status: string;
      current_participants: number;
    }>(
      'select user_id, status, current_participants from "Battle" where id = $1',
      [battleId],
    );
    expect(battle.rows[0]).toMatchObject({
      status: 'WAITING',
      current_participants: 2,
    });
    creator = battle.rows[0].user_id === a.dbUserId ? a : b;
    other = creator === a ? b : a;

    const rows = await db.query<QuestionRow>(
      'select id, "order", question, correct_answer, time_limit from "BattleQuestion" where battle_id = $1 order by "order"',
      [battleId],
    );
    questions = rows.rows;
    expect(questions).toHaveLength(5);

    const mm = [...a.requests, ...b.requests].filter((r) =>
      r.url.includes('/matchmaking/'),
    );
    expect(mm.length).toBeGreaterThan(0);
    for (const r of mm) expect(r.url.startsWith(REALTIME_HOST)).toBe(true);

    for (const p of [a, b]) {
      await p.page.getByRole('button', { name: /enter arena/i }).click();
      await p.page.waitForURL(`**/battle-zone/${battleId}`);
    }
  });

  test('lobby, ready and start reach both players as socket events', async () => {
    await creator.page.getByRole('button', { name: /open lobby/i }).click();
    await waitForEvent(
      other,
      'battle:status_changed',
      (d) => d.status === 'LOBBY',
    );

    for (const p of [creator, other]) {
      await p.page.getByRole('button', { name: /mark as ready/i }).click();
    }
    await waitForEvent(
      creator,
      'battle:participant_ready',
      (d) => d.ready_count === 2,
    );
    await creator.page.getByRole('button', { name: /^start battle$/i }).click();

    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:started');
      await waitForEvent(p, 'battle:question', (d) => d.index === 0);
    }
    const st = await db.query<{ status: string }>(
      'select status from "Battle" where id = $1',
      [battleId],
    );
    expect(st.rows[0].status).toBe('IN_PROGRESS');

    const writes = [...a.requests, ...b.requests].filter(
      (r) => r.url.includes('/battles') && r.method !== 'GET',
    );
    expect(writes.length).toBeGreaterThanOrEqual(4);
    for (const w of writes) expect(w.url.startsWith(REALTIME_HOST)).toBe(true);
    const reads = [...a.requests, ...b.requests].filter(
      (r) => r.url.includes(`/battles/${battleId}`) && r.method === 'GET',
    );
    expect(reads.length).toBeGreaterThan(0);
    for (const r of reads) expect(r.url.startsWith(REST_HOST)).toBe(true);
  });

  test('question 1: both answer; Alpha right, Bravo wrong', async () => {
    const q = questions[0];
    await answer(a, q, q.correct_answer);
    await answer(b, q, wrongOf(q));
    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:question', (d) => d.index === 1);
    }
  });

  test('a reconnect after answering restores the state and the answer', async () => {
    const q = questions[1];
    await answer(a, q, q.correct_answer);
    await answer(b, q, wrongOf(q));

    const before = eventsNamed(b, 'battle:state').length;
    await b.page.reload();
    await waitForEvent(
      b,
      'battle:state',
      (d) => d.status === 'IN_PROGRESS' && d.current_question_index === 1,
    );
    expect(eventsNamed(b, 'battle:state').length).toBeGreaterThan(before);
    await expect(b.page.getByText('Question 2 / 5')).toBeVisible({
      timeout: 20_000,
    });
    await expect(b.page.getByText(q.question)).toBeVisible();
    // Already answered before the reload: the page must not offer it again.
    await expect(
      b.page.getByRole('button', { name: /submit answer/i }),
    ).toHaveCount(0);
    await expect(b.page.getByText('Incorrect — 0 points')).toBeVisible();

    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:question', (d) => d.index === 2);
    }
  });

  test('timer expiry ends a question nobody answered', async () => {
    const q2At = eventsNamed(a, 'battle:question').find(
      (e) => e.data.index === 2,
    )!;
    for (const p of [a, b]) {
      await waitForEvent(p, 'battle:question', (d) => d.index === 3, 45_000);
    }
    const q3At = eventsNamed(a, 'battle:question').find(
      (e) => e.data.index === 3,
    )!;
    const elapsed = q3At.at - q2At.at;
    expect(elapsed).toBeGreaterThanOrEqual(questions[2].time_limit * 1000);
    expect(eventsNamed(a, 'battle:timer_tick').length).toBeGreaterThan(10);

    const answered = await db.query<{ n: number }>(
      'select count(*)::int as n from "BattleAnswer" where question_id = $1',
      [questions[2].id],
    );
    expect(answered.rows[0].n).toBe(0);
  });

  test('the battle completes once and Elo is applied once', async () => {
    for (const q of questions.slice(3)) {
      const index = q.order - 1;
      for (const p of [a, b]) {
        await waitForEvent(p, 'battle:question', (d) => d.index === index);
      }
      await answer(a, q, q.correct_answer);
      await answer(b, q, wrongOf(q));
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

    const answers = await db.query<{
      user_id: string;
      n: number;
      right: number;
    }>(
      'select user_id, count(*)::int as n, count(*) filter (where is_correct)::int as right from "BattleAnswer" where battle_id = $1 group by user_id',
      [battleId],
    );
    const byUser = new Map(answers.rows.map((r) => [r.user_id, r]));
    expect(byUser.get(a.dbUserId!)).toMatchObject({ n: 4, right: 4 });
    expect(byUser.get(b.dbUserId!)).toMatchObject({ n: 4, right: 0 });

    // Give a duplicate completion path time to fire before counting.
    await a.page.waitForTimeout(3_000);
    const ratings = await db.query<{
      user_id: string;
      rating: number;
      games_played: number;
      wins: number;
      losses: number;
    }>(
      'select user_id, rating, games_played, wins, losses from "UserRating" where user_id = any($1)',
      [[a.dbUserId, b.dbUserId]],
    );
    const ra = ratings.rows.find((r) => r.user_id === a.dbUserId)!;
    const rb = ratings.rows.find((r) => r.user_id === b.dbUserId)!;
    expect(ra).toMatchObject({ games_played: 1, wins: 1, losses: 0 });
    expect(rb).toMatchObject({ games_played: 1, wins: 0, losses: 1 });
    expect(ra.rating).toBeGreaterThan(1200);
    expect(ra.rating - 1200).toBe(1200 - rb.rating);

    await expect(
      a.page.getByText(/you won|victory|winner/i).first(),
    ).toBeVisible();
    for (const p of [a, b]) {
      expect(p.failures).toEqual([]);
      expect(eventsNamed(p, 'battle:completed')).toHaveLength(1);
      expect(eventsNamed(p, 'battle:completed')[0].data.winner_id).toBe(
        a.dbUserId,
      );
    }
  });
});
