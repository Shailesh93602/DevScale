import { expect, test } from '@playwright/test';
import {
  FLOW_OPTIONS,
  REST_HOST,
  answer,
  eventsNamed,
  expectNoReloadWorkaround,
  openDb,
  queueOnFirstLoad,
  signIn,
  waitForEvent,
  type PgClient,
  type Player,
  type QuestionRow,
} from './realtimeHelpers';

// First visit with a failing REST host: the socket handshake must create the user row
// itself, or the waiter never hears `matchmaking:matched`. The first `/users/me` fails too,
// so AuthContext starts on its session fallback and must refetch before the battle page
// can recognise the creator. Runs in both flag modes.
let db: PgClient;
let a: Player;
let b: Player;
let battleId: string;

const usersMe = (p: Player) =>
  p.requests.filter((r) => r.url === `${REST_HOST}/api/v1/users/me`);

test.describe.serial('first visit while REST is failing', () => {
  test.beforeAll(async ({ browser }) => {
    db = await openDb();
    a = await signIn(browser, 'cold-Alpha');
    b = await signIn(browser, 'cold-Bravo');
  });

  test.afterAll(async () => {
    await a?.context.close();
    await b?.context.close();
    await db?.end();
  });

  test('a brand-new waiter is matched over the socket with no reload', async () => {
    await queueOnFirstLoad(db, a, { waiter: true });
    await queueOnFirstLoad(db, b, { waiter: false });

    await waitForEvent(a, 'matchmaking:matched');
    battleId = String(eventsNamed(a, 'matchmaking:matched')[0].data.battleId);
    const seats = await db.query<{ user_id: string }>(
      'select user_id from "BattleParticipant" where battle_id = $1',
      [battleId],
    );
    expect(seats.rows.map((r) => r.user_id).sort()).toEqual(
      [a.dbUserId, b.dbUserId].sort(),
    );

    for (const p of [a, b]) {
      await expect(
        p.page.getByRole('button', { name: /enter arena/i }),
      ).toBeVisible();
      await expectNoReloadWorkaround(p);
      expect(p.failures).toEqual([]);
    }
    // The REST host really did refuse them first.
    const injected = [...a.injected, ...b.injected];
    expect(injected.length).toBeGreaterThan(0);
  });

  test('after a failed first /users/me the creator can still open the lobby and start', async () => {
    // Each player's first profile load was refused, then a refetch loaded it.
    for (const p of [a, b]) {
      expect(
        p.injected.some((r) => r.includes('/users/me')),
        `${p.label}'s first /users/me should have failed`,
      ).toBe(true);
      expect(
        usersMe(p).length,
        `${p.label} refetched /users/me`,
      ).toBeGreaterThan(1);
    }

    const row = await db.query<{ user_id: string }>(
      'select user_id from "Battle" where id = $1',
      [battleId],
    );
    const creator = row.rows[0].user_id === a.dbUserId ? a : b;
    const other = creator === a ? b : a;

    for (const p of [a, b]) {
      await p.page.getByRole('button', { name: /enter arena/i }).click();
      await p.page.waitForURL(`**/battle-zone/${battleId}`);
    }

    if (FLOW_OPTIONS) {
      // MATCHMAKING_AUTO_START: no lobby, the battle starts by itself.
      await expect(
        creator.page.getByRole('button', { name: /open lobby/i }),
      ).toHaveCount(0);
    } else {
      // Only rendered when the page knows our User.id is the battle's creator.
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
      await creator.page
        .getByRole('button', { name: /^start battle$/i })
        .click();
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

    // Both pages see themselves as participants: each can answer question 1.
    const q = (
      await db.query<QuestionRow>(
        'select id, "order", question, correct_answer, time_limit from "BattleQuestion" where battle_id = $1 and "order" = 1',
        [battleId],
      )
    ).rows[0];
    for (const p of [a, b]) await answer(p, q, q.correct_answer);
    const answered = await db.query<{ user_id: string }>(
      'select user_id from "BattleAnswer" where question_id = $1',
      [q.id],
    );
    expect(answered.rows.map((r) => r.user_id).sort()).toEqual(
      [a.dbUserId, b.dbUserId].sort(),
    );
    for (const p of [a, b]) {
      // The battle page opens its own socket, so only the reload count still applies.
      expect(p.documentLoads, `${p.label} document loads`).toBe(1);
      expect(p.failures).toEqual([]);
      await expect(p.page.getByText(/couldn.t load your profile/i)).toHaveCount(
        0,
      );
    }
  });
});
