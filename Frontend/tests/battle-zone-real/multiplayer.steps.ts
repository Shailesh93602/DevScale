import { expect, test, type Page } from '@playwright/test';
import { loginAsStudent, loginAsPlayer2 } from '../utils/login';
import {
  BZ,
  goto,
  clickNext,
  selectWorkingRoadmap,
  waitForBattleList,
} from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 6: Multi-User — Join, Ready, Start, Play, Leaderboard
// ─────────────────────────────────────────────────────────────────────────────
export function registerMultiplayerFlow() {
  test.describe('Flow 6 — Multi-user gameplay (Player1 creates, Player2 joins)', () => {
    test.setTimeout(300000); // 5 min for full gameplay
    test.describe.configure({ mode: 'serial' });

    let battleId: string;
    let player2Page: Page;

    /** Create a PRACTICE battle through the wizard as the page's user. */
    async function createTestBattle(page: Page): Promise<string> {
      await goto(page, `${BZ}/create`);
      await page
        .getByPlaceholder('Enter a catchy title')
        .fill(`Gameplay Test ${Date.now()}`);
      await page
        .getByPlaceholder('Describe what this battle is about')
        .fill('Multi-user gameplay test.');
      await clickNext(page);

      const roadmapTitle = await selectWorkingRoadmap(page);
      await clickNext(page);
      await expect(page.getByText('Step 3 of 4')).toBeVisible({
        timeout: 5000,
      });

      // PRACTICE: no per-question timer, so the test paces the battle.
      const practiceBtn = page.getByRole('button', {
        name: 'Practice',
        exact: true,
      });
      await expect(practiceBtn).toBeVisible();
      await practiceBtn.click();
      await clickNext(page);

      await expect(page.getByText('Step 4 of 4')).toBeVisible({
        timeout: 5000,
      });
      await expect(
        page.getByText(roadmapTitle, { exact: true }).first(),
      ).toBeVisible({ timeout: 5000 });

      const launchBtn = page.getByRole('button', {
        name: /create battle.*load questions/i,
      });
      await expect(launchBtn).toBeVisible({ timeout: 8000 });
      await expect(launchBtn).toBeEnabled({ timeout: 8000 });
      await expect(page.getByText('Sampling questions...')).toBeHidden({
        timeout: 15000,
      });

      const creationResponsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/v1/battles') &&
          resp.request().method() === 'POST',
        { timeout: 35000 },
      );
      await launchBtn.click();
      const creationResp = await creationResponsePromise;
      const creationJson = await creationResp.json();
      expect(
        creationResp.status(),
        `POST /battles: ${JSON.stringify(creationJson).slice(0, 300)}`,
      ).toBeLessThan(300);
      const createdUuid: string = creationJson?.data?.id;
      expect(createdUuid, 'created battle has no id').toBeTruthy();
      await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
        timeout: 45000,
      });
      return createdUuid;
    }

    /** Join as the page's user: the join is answered 2xx and Leave appears. */
    async function joinAsParticipant(pg: Page, id: string) {
      await goto(pg, `/battle-zone/${id}`);
      await expect(pg.getByText('Waiting for players')).toBeVisible({
        timeout: 10000,
      });
      const joinBtn = pg.getByRole('button', { name: 'Join Battle' });
      await expect(joinBtn).toBeVisible({ timeout: 10000 });
      await expect(joinBtn).toBeEnabled({ timeout: 5000 });
      const joinRespPromise = pg.waitForResponse(
        (r) =>
          r.url().includes('/battles/') &&
          r.url().includes('/join') &&
          r.request().method() === 'POST',
        { timeout: 15000 },
      );
      await joinBtn.click();
      const joinResp = await joinRespPromise;
      expect(joinResp.status(), await joinResp.text()).toBeLessThan(300);
      await expect(pg.getByRole('button', { name: 'Leave' })).toBeVisible({
        timeout: 15000,
      });
    }

    test('Player1 creates a battle and sees WAITING phase', async ({
      page,
    }) => {
      await loginAsStudent(page);
      battleId = await createTestBattle(page);

      await expect(page.getByText('Waiting for players')).toBeVisible({
        timeout: 10000,
      });
      // The creator is not auto-enrolled: the page offers Join.
      await expect(
        page.getByRole('button', { name: 'Join Battle' }),
      ).toBeVisible({ timeout: 10000 });
    });

    test('Player1 joins their own battle', async ({ page }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await joinAsParticipant(page, battleId);
    });

    test('Player2 (different account) can see the battle in the list', async ({
      browser,
    }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      // Create a second browser context for Player2
      const ctx2 = await browser.newContext();
      player2Page = await ctx2.newPage();
      await loginAsPlayer2(player2Page);
      await goto(player2Page, BZ);
      await waitForBattleList(player2Page);

      await expect(player2Page.getByText('Battle Zone Arena')).toBeVisible({
        timeout: 10000,
      });
    });

    test('Player2 joins the created battle', async () => {
      expect(
        battleId && player2Page,
        'battle or player-2 session missing from the previous steps',
      ).toBeTruthy();
      await joinAsParticipant(player2Page, battleId);
    });

    test('both players see each other in participant list', async ({
      page,
    }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);

      await expect(page.getByText('Waiting for players')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText(/2 \/ \d+ players joined/)).toBeVisible({
        timeout: 8000,
      });
      await expect(page.getByText('Participants (2)')).toBeVisible({
        timeout: 8000,
      });
      // Usernames render in the participant list's font-medium spans (scoped so
      // the avatar fallback, which prepends the first letter, does not match).
      await expect(
        page.locator('span.font-medium', { hasText: 'teststudent' }).first(),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        page.locator('span.font-medium', { hasText: 'battleplayer2' }).first(),
      ).toBeVisible({ timeout: 5000 });
    });

    test('Player1 opens lobby then marks ready', async ({ page }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);
      await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
        timeout: 10000,
      });

      // Both players are enrolled, so the creator is offered "Open Lobby". Each
      // control here used to sit behind an isVisible() guard with a console.log
      // in the else branch — a lobby that never opened still passed.
      const openLobbyBtn = page.getByRole('button', { name: 'Open Lobby' });
      await expect(openLobbyBtn).toBeVisible({ timeout: 10000 });
      const lobbyRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes('/battles/') &&
          r.url().includes('/lobby') &&
          r.request().method() === 'POST',
        { timeout: 10000 },
      );
      await openLobbyBtn.click();
      const lobbyResp = await lobbyRespPromise;
      expect(lobbyResp.status(), await lobbyResp.text()).toBe(200);
      await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
        timeout: 10000,
      });

      const markReadyBtn = page.getByRole('button', { name: 'Mark as Ready' });
      await expect(markReadyBtn).toBeVisible({ timeout: 8000 });
      await markReadyBtn.click();
      await expect(page.getByText(/you are ready/i)).toBeVisible({
        timeout: 8000,
      });
    });

    test('Player2 marks ready', async () => {
      expect(
        battleId && player2Page,
        'battle or player-2 session missing from the previous steps',
      ).toBeTruthy();
      await goto(player2Page, `/battle-zone/${battleId}`);
      await expect(player2Page.getByText('Lobby — Get Ready!')).toBeVisible({
        timeout: 10000,
      });

      const markReadyBtn = player2Page.getByRole('button', {
        name: 'Mark as Ready',
      });
      await expect(markReadyBtn).toBeVisible({ timeout: 10000 });
      const readyRespPromise = player2Page.waitForResponse(
        (r) =>
          r.url().includes('/battles/') &&
          r.url().includes('/ready') &&
          r.request().method() === 'POST',
        { timeout: 10000 },
      );
      await markReadyBtn.click();
      const readyResp = await readyRespPromise;
      expect(readyResp.status(), await readyResp.text()).toBeLessThan(300);
      await expect(markReadyBtn).toBeHidden({ timeout: 8000 });
    });

    test('Player1 (creator) can start the battle when all ready', async ({
      page,
    }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);
      await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
        timeout: 10000,
      });

      // Everyone is ready, so the creator must be offered Start. An absent
      // Start button used to be logged, and the test passed without starting.
      const startBtn = page.getByRole('button', { name: 'Start Battle' });
      await expect(startBtn).toBeVisible({ timeout: 15000 });
      await expect(startBtn).toBeEnabled({ timeout: 15000 });
      const startRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes('/battles/') &&
          r.url().includes('/start') &&
          r.request().method() === 'POST',
        { timeout: 15000 },
      );
      await startBtn.click();
      const startResp = await startRespPromise;
      expect(startResp.status(), await startResp.text()).toBe(200);
      // The lobby transitions on the battle:started socket event. That event
      // is the realtime claim itself, so it is asserted rather than papered
      // over with a reload.
      await expect(
        page.getByText(/In Progress|Battle in progress/i),
      ).toBeVisible({ timeout: 20000 });
    });

    test('questions appear when battle is IN_PROGRESS', async ({ page }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);

      // A participant in a live battle sees the current question. The previous
      // regex (/question|battle|progress|waiting|lobby/) matched every possible
      // state of the page and could not fail.
      await expect(page.getByText('In Progress').first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.locator('p.text-lg.font-semibold').first()).toBeVisible(
        {
          timeout: 15000,
        },
      );
      await expect(
        page.getByRole('button', { name: 'Submit Answer' }),
      ).toBeVisible();
    });

    test('Player1 can see MCQ options and select an answer', async ({
      page,
    }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);

      // Each option button renders a letter badge (A–D) next to the answer text.
      // Match on that badge so selection doesn't depend on how the answer reads.
      const option = page
        .getByRole('button')
        .filter({ has: page.locator('span').filter({ hasText: /^[A-D]$/ }) })
        .first();
      await expect(option).toBeVisible({ timeout: 15000 });

      const submitBtn = page.getByRole('button', { name: /submit answer/i });
      await expect(submitBtn).toBeVisible();
      await expect(
        submitBtn,
        'Submit must be disabled before an option is chosen',
      ).toBeDisabled();
      await option.click();
      await expect(submitBtn).toBeEnabled();

      const answerRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes('/battles/answer') &&
          r.request().method() === 'POST',
        { timeout: 15000 },
      );
      await submitBtn.click();
      const answerResp = await answerRespPromise;
      expect(answerResp.status(), await answerResp.text()).toBeLessThan(300);
      // Feedback renders once the submit response lands ("✓ Correct! +N points"
      // or "✗ Incorrect — 0 points").
      await expect(page.getByText(/Correct!|Incorrect/i).first()).toBeVisible({
        timeout: 12000,
      });
    });

    test('leaderboard tab shows participants and scores', async ({ page }) => {
      expect(
        battleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${battleId}`);

      // The Leaderboard tab is offered during and after the battle.
      const lbTab = page.getByRole('button', { name: 'Leaderboard' });
      await expect(lbTab).toBeVisible({ timeout: 10000 });
      await lbTab.click();
      await expect(
        page.getByText(/teststudent|battleplayer2/i).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    // Cleanup: close player2 context
    test.afterAll(async () => {
      if (player2Page && !player2Page.isClosed()) {
        await player2Page.context().close();
      }
    });
  });
}
