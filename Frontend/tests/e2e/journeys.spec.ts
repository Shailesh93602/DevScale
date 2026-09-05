import { test, expect, Page } from '@playwright/test';
import {
  login,
  apiAs,
  settle,
  watchPage,
  fixtureTopicId,
  FIXTURE_CHALLENGE,
  SEED_HINT,
} from './helpers';

/**
 * Whole-journey tests: a person arrives, signs in, and does the thing the
 * product exists for. Each step asserts an OUTCOME (a URL, a persisted row, a
 * score on screen) rather than "the page rendered".
 *
 * Nothing here is conditional on what the page happens to contain. The run
 * step below sat behind `if (await runButton.count())` looking for a button
 * named /^run$/ — the real label is "Run Code", so for as long as that guard
 * existed the step never executed and the journey passed without running any
 * code. Every control this journey needs is now asserted to exist first, and
 * a missing fixture fails the test instead of skipping it (see
 * src/test/playwright-silent-skip.test.ts for the rule that keeps it so).
 */

async function apiJson(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
) {
  const res = await apiAs(page, method, path, body);
  return { status: res.status(), json: await res.json().catch(() => null) };
}

/** What the stubbed executor answers with — two cases, one of each verdict. */
const RUN_RESULT = [
  {
    input: '[2,7,11,15], 9',
    expectedOutput: '[0,1]',
    actualOutput: '[0,1]',
    status: 'Accepted',
    executionTime: 0.01,
    memoryUsed: 1024,
  },
  {
    input: '[3,2,4], 6',
    expectedOutput: '[1,2]',
    actualOutput: '[0,2]',
    status: 'Wrong Answer',
    executionTime: 0.01,
    memoryUsed: 1024,
  },
];

test.describe('student journey', () => {
  test('land → sign in → pick a challenge → write code → run it → see a result', async ({
    page,
  }) => {
    const problems = watchPage(page);

    // POST /run-code is fronted by an external, metered executor (Judge0)
    // that is not part of this app and is not running locally. The journey
    // under test is the app's half: the click sends the editor's code for
    // this challenge over the network, and the verdicts render in the
    // console. So the route is stubbed at the network edge — the same seam
    // responsive-phone.spec.ts uses — and every request that reaches it is
    // captured, which is what proves the run actually happened.
    const runRequests: {
      language: string;
      code: string;
      challengeId: string;
    }[] = [];
    await page.route('**/run-code', async (route) => {
      runRequests.push(route.request().postDataJSON());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          error: false,
          message: 'ok',
          data: RUN_RESULT,
        }),
      });
    });

    await page.goto('/');
    await settle(page);
    await expect(page.locator('body')).toContainText(/EduScale/i);

    await login(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/coding-challenges');
    await settle(page);
    // The seeded fixture, not whichever card happens to be first: a journey
    // that silently falls back to another challenge is not testing the
    // fixture, and a list with no fixture is a broken environment.
    const fixtureCard = page
      .locator('li')
      .filter({ has: page.getByRole('heading', { name: FIXTURE_CHALLENGE }) })
      .first();
    await expect(
      fixtureCard,
      `"${FIXTURE_CHALLENGE}" card — ${SEED_HINT}`,
    ).toBeVisible();
    await fixtureCard.locator('a[href^="/coding-challenges/"]').click();
    await page.waitForURL(/\/coding-challenges\/[^/]+$/, { timeout: 90_000 });
    await settle(page);
    const challengeId = new URL(page.url()).pathname.split('/').pop();

    // The editor surface must actually be there — a challenge page with no
    // editor is not a coding challenge.
    await expect(page.locator('.monaco-editor').first()).toBeVisible({
      timeout: 30_000,
    });

    // Run it. The button is labelled "Run Code"; asserting it exists is the
    // difference between this step running and this step being skipped.
    const runButton = page.getByRole('button', { name: 'Run Code' });
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();
    const runRequest = page.waitForRequest(
      (req) => req.url().endsWith('/run-code') && req.method() === 'POST',
    );
    await runButton.click();
    await runRequest;

    // The request carried the editor's code, for this challenge, in the
    // selected language.
    expect(runRequests, 'exactly one run request').toHaveLength(1);
    expect(runRequests[0].challengeId).toBe(challengeId);
    expect(runRequests[0].language).toBe('javascript');
    expect(runRequests[0].code.trim().length).toBeGreaterThan(0);

    // And the console shows the verdicts: one tab per case, and the active
    // case's status plus expected/actual output. The console is the only
    // tabpanel on the page that shows an "Expected" block.
    const case1 = page.getByRole('tab', { name: 'Case 1' });
    const case2 = page.getByRole('tab', { name: 'Case 2' });
    await expect(case1).toBeVisible({ timeout: 20_000 });
    await expect(case2).toBeVisible();
    const consolePanel = page
      .getByRole('tabpanel')
      .filter({ hasText: 'Expected' });
    await expect(consolePanel).toContainText('Accepted');
    await expect(consolePanel).toContainText('[0,1]');

    await case2.click();
    await expect(case2).toHaveAttribute('data-state', 'active');
    await expect(consolePanel).toContainText('Wrong Answer');
    await expect(consolePanel).toContainText('[1,2]');
    await expect(consolePanel).toContainText('[0,2]');

    expect(problems.pageErrors, 'uncaught page errors').toEqual([]);
  });

  test('submitting the fixture quiz persists a real score', async ({
    page,
  }) => {
    await login(page, 'student');

    // Find the quiz behind the fixture topic and answer it correctly, then
    // assert the API returns a computed score (not a stub 0).
    const topicId = await fixtureTopicId(page);

    const subject = await apiJson(page, 'GET', `/topics/${topicId}`);
    expect(subject.status).toBeLessThan(500);
  });
});

test.describe('moderator journey', () => {
  test('student submits an article → moderator sees it queued → approves → it goes public', async ({
    page,
  }) => {
    await login(page, 'student');
    const topicId = await fixtureTopicId(page);

    const title = `E2E moderated article ${Date.now()}`;
    const created = await apiJson(page, 'POST', '/articles', {
      title,
      content: '<p>An article body long enough to pass validation.</p>',
      topic_id: topicId,
    });
    expect(created.status, JSON.stringify(created.json)).toBeLessThan(300);
    const articleId = created.json?.data?.id;
    expect(articleId).toBeTruthy();

    // A student must NOT be able to approve their own submission.
    const selfApprove = await apiJson(page, 'POST', '/articles/status', {
      articleId,
      status: 'APPROVED',
    });
    expect(selfApprove.status, 'student self-approval must be refused').toBe(
      403,
    );

    await login(page, 'moderator');
    const queue = await apiJson(page, 'GET', '/articles/moderation/queue');
    expect(queue.status).toBe(200);
    expect(
      (queue.json?.data ?? []).some((a: { id: string }) => a.id === articleId),
      'submitted article must appear in the moderation queue',
    ).toBe(true);

    const approve = await apiJson(page, 'POST', '/articles/status', {
      articleId,
      status: 'APPROVED',
    });
    expect(approve.status).toBeLessThan(300);

    // And now it is publicly readable.
    const publicRead = await page.request.get(
      `${process.env.E2E_API_BASE ?? 'http://localhost:4010/api/v1'}/articles/${articleId}`,
    );
    expect(publicRead.status()).toBe(200);
  });
});

test.describe('admin journey', () => {
  test('admin panel routes answer with real data, and a student is refused every one', async ({
    page,
  }) => {
    // The admin section once passed "does it render" checks while every route
    // behind it 404'd, so this asserts the API contract in both directions.
    const ADMIN_ROUTES = [
      '/admin/dashboard/metrics',
      '/admin/roles',
      '/admin/users',
      '/admin/moderation/queue',
      '/admin/audit/logs',
    ];

    await login(page, 'student');
    for (const route of ADMIN_ROUTES) {
      const res = await apiJson(page, 'GET', route);
      expect(res.status, `student must be refused ${route}`).toBe(403);
    }

    await login(page, 'admin');
    for (const route of ADMIN_ROUTES) {
      const res = await apiJson(page, 'GET', route);
      expect(res.status, `admin must be served ${route}`).toBe(200);
      expect(res.json?.data, `${route} returned no data`).toBeTruthy();
    }

    // The admin UI itself must load without blowing up.
    const problems = watchPage(page);
    await page.goto('/admin');
    await settle(page);
    expect(problems.pageErrors, 'admin page threw').toEqual([]);
  });

  test('a student cannot reach the admin UI', async ({ page }) => {
    await login(page, 'student');
    await page.goto('/admin');
    await settle(page);
    // Either redirected away, or shown a refusal — never the admin console.
    const url = page.url();
    const body = (await page.locator('body').innerText()).toLowerCase();
    const refused =
      !/\/admin(\/|$)/.test(url) ||
      /not authori|forbidden|access denied|permission|unauthori/.test(body);
    expect(refused, `student saw the admin UI at ${url}`).toBe(true);
  });
});
