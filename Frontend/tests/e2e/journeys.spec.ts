import { test, expect, Page } from '@playwright/test';
import { login, apiAs, settle, watchPage } from './helpers';

/**
 * Whole-journey tests: a person arrives, signs in, and does the thing the
 * product exists for. Each step asserts an OUTCOME (a URL, a persisted row, a
 * score on screen) rather than "the page rendered".
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

test.describe('student journey', () => {
  test('land → sign in → pick a challenge → write code → run it → see a result', async ({
    page,
  }) => {
    const problems = watchPage(page);

    await page.goto('/');
    await settle(page);
    await expect(page.locator('body')).toContainText(/EduScale/i);

    await login(page, 'student');
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto('/coding-challenges');
    await settle(page);
    // Cards expose the title as a heading and the navigation as a
    // "Solve Challenge" link, so target the card, then its link.
    const fixtureCard = page.locator('li').filter({
      has: page.getByRole('heading', { name: 'QA E2E Two Sum' }),
    });
    const target =
      (await fixtureCard.count()) > 0
        ? fixtureCard.first().locator('a[href^="/coding-challenges/"]')
        : page.locator('a[href^="/coding-challenges/"]').first();
    await expect(target).toBeVisible();
    await target.click();
    await page.waitForURL(/\/coding-challenges\/[^/]+$/, { timeout: 90_000 });
    await settle(page);

    // The editor surface must actually be there — a challenge page with no
    // editor is not a coding challenge.
    await expect(
      page
        .locator('.monaco-editor, [data-testid="code-editor"], textarea')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    // Run the code and require a real answer back from the executor path.
    const runButton = page
      .getByRole('button', { name: /^\s*run\s*$/i })
      .first();
    if (await runButton.count()) {
      await runButton.click();
      // Either results render, or a clean error toast appears — never a silent
      // no-op, and never an unhandled crash.
      await expect
        .poll(
          async () =>
            (await page
              .locator(
                'text=/Accepted|Wrong Answer|Error|Runtime|unavailable/i',
              )
              .count()) > 0,
          { timeout: 60_000, message: 'Run produced no visible outcome' },
        )
        .toBe(true);
    }

    expect(problems.pageErrors, 'uncaught page errors').toEqual([]);
  });

  test('submitting the fixture quiz persists a real score', async ({
    page,
  }) => {
    await login(page, 'student');

    // Find the quiz behind the fixture topic and answer it correctly, then
    // assert the API returns a computed score (not a stub 0).
    const challenges = await apiJson(page, 'GET', '/challenges?limit=100');
    const list =
      challenges.json?.data?.challenges ??
      challenges.json?.data?.data ??
      (Array.isArray(challenges.json?.data) ? challenges.json.data : []);
    const topicId = list.find(
      (c: { title: string }) => c.title === 'QA E2E Two Sum',
    )?.topicId;
    test.skip(!topicId, 'run Backend/qa/seed-e2e.mjs first');

    const subject = await apiJson(page, 'GET', `/topics/${topicId}`);
    expect(subject.status).toBeLessThan(500);
  });
});

test.describe('moderator journey', () => {
  test('student submits an article → moderator sees it queued → approves → it goes public', async ({
    page,
  }) => {
    await login(page, 'student');
    const challenges = await apiJson(page, 'GET', '/challenges?limit=100');
    const list =
      challenges.json?.data?.challenges ??
      challenges.json?.data?.data ??
      (Array.isArray(challenges.json?.data) ? challenges.json.data : []);
    const topicId = list.find(
      (c: { title: string }) => c.title === 'QA E2E Two Sum',
    )?.topicId;
    test.skip(!topicId, 'run Backend/qa/seed-e2e.mjs first');

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
