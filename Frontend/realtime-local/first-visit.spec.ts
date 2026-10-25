import { expect, test } from '@playwright/test';
import {
  eventsNamed,
  expectNoReloadWorkaround,
  openDb,
  queueOnFirstLoad,
  signIn,
  waitForEvent,
  type PgClient,
  type Player,
} from './realtimeHelpers';

// First visit with a failing REST host: the socket handshake must create the user row
// itself, or the waiter never hears `matchmaking:matched`. Runs in both flag modes.
let db: PgClient;
let a: Player;
let b: Player;

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
    const battleId = eventsNamed(a, 'matchmaking:matched')[0].data.battleId;
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
});
