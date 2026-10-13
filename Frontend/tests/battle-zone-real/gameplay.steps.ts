import { expect, test, type Page } from '@playwright/test';
import { loginAsStudent, loginAsPlayer2 } from '../utils/login';
import { BZ, goto, clickNext, selectWorkingRoadmap } from './support.steps';

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 11: Comprehensive Battle Gameplay
// Tests: WAITING → LOBBY → IN_PROGRESS → COMPLETED
//        Question rendering, answer submission, correctness feedback,
//        scoring, leaderboard accuracy, winner determination
// ─────────────────────────────────────────────────────────────────────────────
export function registerGameplayFlow() {
  test.describe('Flow 11 — Complete battle gameplay (answer submission + scoring)', () => {
    test.setTimeout(600000); // 10 minutes: setup + lobby + every question + completion
    test.describe.configure({ mode: 'serial' });

    let gameplayBattleId: string;
    let totalQuestions = 0;
    let player2Page: Page;

    const questionText = (pg: Page) =>
      pg.locator('p.text-lg.font-semibold').first();

    /** Create a QUICK battle with the wizard defaults; returns its id. */
    async function createGameplayBattle(page: Page): Promise<string> {
      await goto(page, `${BZ}/create`);
      await page
        .getByPlaceholder('Enter a catchy title')
        .fill(`[GAMEPLAY] Flow 11 ${Date.now()}`);
      await page
        .getByPlaceholder('Describe what this battle is about')
        .fill('Comprehensive gameplay test.');
      await clickNext(page);

      await selectWorkingRoadmap(page);
      await clickNext(page);

      // Step 3: QUICK is the default type; assert it rather than click "if
      // visible". The sliders keep their defaults — the loop below reads the
      // question count from the created battle instead of assuming five.
      await expect(page.getByText('Step 3 of 4')).toBeVisible({
        timeout: 5000,
      });
      const quickBtn = page.getByRole('button', { name: 'Quick', exact: true });
      await expect(quickBtn).toBeVisible();
      await quickBtn.click();
      await clickNext(page);

      await expect(page.getByText('Step 4 of 4')).toBeVisible({
        timeout: 5000,
      });
      const launchBtn = page.getByRole('button', {
        name: /create battle.*load questions/i,
      });
      await expect(launchBtn).toBeVisible({ timeout: 8000 });
      await expect(launchBtn).toBeEnabled({ timeout: 8000 });
      await expect(page.getByText('Sampling questions...')).toBeHidden({
        timeout: 15000,
      });

      const creationRespPromise = page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/v1/battles') &&
          resp.request().method() === 'POST',
        { timeout: 35000 },
      );
      await launchBtn.click();
      const creationResp = await creationRespPromise;
      const creationJson = await creationResp.json();
      expect(
        creationResp.status(),
        `POST /battles: ${JSON.stringify(creationJson).slice(0, 300)}`,
      ).toBeLessThan(300);
      const uuid: string = creationJson?.data?.id;
      expect(uuid, 'created battle has no id').toBeTruthy();
      totalQuestions = Number(creationJson?.data?.total_questions ?? 0);
      expect(totalQuestions, 'created battle has no questions').toBeGreaterThan(
        0,
      );
      await page.waitForURL(/\/battle-zone\/(?!create)[a-z0-9-]+/, {
        timeout: 45000,
      });
      return uuid;
    }

    /** Join as the page's user: the join is answered 2xx and Leave appears. */
    async function joinBattle(pg: Page, battleId: string) {
      await goto(pg, `/battle-zone/${battleId}`);
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

    /** Mark ready as the page's user; the button goes away once accepted. */
    async function markReady(pg: Page) {
      const markReadyBtn = pg.getByRole('button', { name: 'Mark as Ready' });
      await expect(markReadyBtn).toBeVisible({ timeout: 10000 });
      const readyRespPromise = pg.waitForResponse(
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
    }

    /**
     * Answer the current question as the page's user: pick the first option,
     * submit, get a 2xx and on-screen feedback. Returns the question's text so
     * the caller can wait for the next one.
     */
    async function answerCurrentQuestion(pg: Page, label: string) {
      const q = questionText(pg);
      await expect(q).toBeVisible({ timeout: 30000 });
      const text = (await q.innerText()).trim();

      const optionGrid = pg.locator('.grid.gap-3').first();
      await expect(optionGrid).toBeVisible({ timeout: 5000 });
      const submitBtn = pg.getByRole('button', { name: 'Submit Answer' });
      await expect(submitBtn).toBeVisible();
      await optionGrid.locator('button').first().click();
      await expect(submitBtn).toBeEnabled({ timeout: 5000 });

      const answerRespPromise = pg.waitForResponse(
        (r) =>
          r.url().includes('/battles/answer') &&
          r.request().method() === 'POST',
        { timeout: 15000 },
      );
      await submitBtn.click();
      const answerResp = await answerRespPromise;
      const body = await answerResp.text();
      expect(answerResp.status(), `${label} answer: ${body}`).toBeLessThan(300);
      // The server's verdict is the outcome; it must be a real boolean.
      expect(
        typeof JSON.parse(body)?.data?.is_correct,
        `${label} answer carried no verdict: ${body}`,
      ).toBe('boolean');
      // On screen: "✓ Correct! +N points" / "✗ Incorrect — 0 points". When this
      // is the last answer of the battle the server completes it immediately and
      // the feedback is replaced by the completion view ("Battle Complete!", or
      // "You Won! 🎉" on the winner's page), which is also proof the answer
      // landed.
      await expect(
        pg.getByText(/Correct!|Incorrect|Battle Complete!|You Won!/i).first(),
      ).toBeVisible({ timeout: 12000 });
      return text;
    }

    test('creates gameplay battle and both players join', async ({
      page,
      browser,
    }) => {
      await loginAsStudent(page);
      gameplayBattleId = await createGameplayBattle(page);

      await joinBattle(page, gameplayBattleId);

      const ctx2 = await browser.newContext();
      player2Page = await ctx2.newPage();
      await loginAsPlayer2(player2Page);
      await joinBattle(player2Page, gameplayBattleId);

      await goto(page, `/battle-zone/${gameplayBattleId}`);
      await expect(page.getByText(/2 \/ \d+ players joined/)).toBeVisible({
        timeout: 8000,
      });
    });

    test('creator opens lobby and both players mark ready', async ({
      page,
    }) => {
      expect(
        gameplayBattleId && player2Page,
        'battle or player-2 session missing from the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${gameplayBattleId}`);
      await expect(page.getByText('Waiting for players')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByRole('button', { name: 'Leave' })).toBeVisible({
        timeout: 10000,
      });

      // "Open Lobby" is offered to the creator once ≥2 players are enrolled.
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

      await markReady(page);
      await expect(page.getByText(/you are ready/i)).toBeVisible({
        timeout: 8000,
      });

      await goto(player2Page, `/battle-zone/${gameplayBattleId}`);
      await expect(player2Page.getByText('Lobby — Get Ready!')).toBeVisible({
        timeout: 10000,
      });
      await markReady(player2Page);
    });

    test('creator starts battle and questions appear', async ({ page }) => {
      expect(
        gameplayBattleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${gameplayBattleId}`);
      await expect(page.getByText('Lobby — Get Ready!')).toBeVisible({
        timeout: 15000,
      });

      // Both players marked ready, so the creator is offered Start (enabled
      // once the questions are dealt). The socket must be live before the
      // click, or the client misses battle:started.
      await expect(page.getByText('Live', { exact: true })).toBeVisible({
        timeout: 15000,
      });
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

      await expect(
        page.getByText(/In Progress|Battle in progress/i),
      ).toBeVisible({ timeout: 20000 });
      await expect(questionText(page)).toBeVisible({ timeout: 20000 });
      // Nothing chosen yet, so Submit is disabled (the old Flow 12 assertion,
      // which only ran if an IN_PROGRESS battle happened to be listed).
      await expect(
        page.getByRole('button', { name: 'Submit Answer' }),
      ).toBeDisabled();
    });

    test('both players answer every question with correctness feedback', async ({
      page,
    }) => {
      expect(
        gameplayBattleId && player2Page,
        'battle or player-2 session missing from the previous steps',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${gameplayBattleId}`);
      await goto(player2Page, `/battle-zone/${gameplayBattleId}`);
      await expect(page.getByText('In Progress').first()).toBeVisible({
        timeout: 15000,
      });

      for (let qIdx = 0; qIdx < totalQuestions; qIdx++) {
        const label = `Q${qIdx + 1}/${totalQuestions}`;
        const asked = await answerCurrentQuestion(page, `${label} P1`);
        await answerCurrentQuestion(player2Page, `${label} P2`);

        if (qIdx < totalQuestions - 1) {
          // The server advances after the per-question timer (30s default) or
          // once everyone has answered; either way the next question must be a
          // different one.
          await expect(questionText(page)).not.toHaveText(asked, {
            timeout: 45000,
          });
          await expect(questionText(player2Page)).not.toHaveText(asked, {
            timeout: 45000,
          });
        }
      }
    });

    test('battle completes and final leaderboard shows scores', async ({
      page,
    }) => {
      expect(
        gameplayBattleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${gameplayBattleId}`);

      // Every question is answered; the server completes the battle when the
      // last answer lands or the last timer runs out. Allow one timer plus
      // slack. The heading reads "Battle Complete!" — or "You Won! 🎉" when the
      // viewer is the winner.
      await expect(
        page.getByRole('heading', { name: /Battle Complete!|You Won!/ }),
      ).toBeVisible({ timeout: 90000 });
      await expect(page.getByText('Final Standings')).toBeVisible({
        timeout: 8000,
      });
      // Both players, each with a score.
      await expect(page.locator('text=/\\d+ pts/')).toHaveCount(2, {
        timeout: 8000,
      });
    });

    test('final leaderboard shows both players with correct scores and ranking', async ({
      page,
    }) => {
      expect(
        gameplayBattleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `/battle-zone/${gameplayBattleId}`);
      await expect(page.getByText('Final Standings')).toBeVisible({
        timeout: 15000,
      });

      const lbTab = page.getByRole('button', { name: 'Leaderboard' });
      await expect(lbTab).toBeVisible({ timeout: 10000 });
      await lbTab.click();
      await expect(page.getByText(/teststudent/i).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText(/battleplayer2/i).first()).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText(/\d+ correct/i).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test('statistics page reflects completed battle in user history', async ({
      page,
    }) => {
      expect(
        gameplayBattleId,
        'battle was not created by the previous step',
      ).toBeTruthy();
      await loginAsStudent(page);
      await goto(page, `${BZ}/statistics`);

      // The battles-played card reads "<n> battles"; a completed battle makes
      // <n> at least one. The old assertion matched the word "battles" anywhere
      // on the page. The Win Rate card next to it used to read "0 of 0 battles"
      // for this same player — the page read the counters from the wrong level
      // of the payload; fixed 2026-09-05, and Flow 8 now asserts that card
      // against the API and against this one.
      // Pinned to the Performance-by-Difficulty card: since the Top Topics list
      // derives from the same data, "<n> battles" now legitimately appears in
      // two cards and a bare getByText is a strict-mode violation.
      await expect(page.getByTestId('difficulty-battles').first()).toHaveText(
        /^[1-9]\d* battles$/,
        { timeout: 15000 },
      );
      await expect(page.getByTestId('stat-card-win-rate')).toContainText(
        /\d+ of [1-9]\d* battles/,
      );
    });

    test.afterAll(async () => {
      if (player2Page && !player2Page.isClosed()) {
        await player2Page.context().close();
      }
    });
  });
}
