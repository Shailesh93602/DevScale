import { test, expect } from '@playwright/test';

/**
 * The anonymous read-only view, asserted against the running app with NO
 * session — no login helper is called anywhere in this file, so every request
 * here is what a recruiter or a crawler sends.
 *
 * Run with `npx playwright test -c playwright.public.config.ts` — a config
 * with no globalSetup, because the default one seeds battles through
 * Backend/.env. No backend is required: the two list pages must render their
 * shell and an honest state whether or not the API answers, and the recorded
 * battle is static.
 */

test.describe('anonymous read-only view', () => {
  test('GET /career-roadmap returns 200 with the roadmap page content, not a login redirect', async ({
    page,
  }) => {
    const res = await page.goto('/career-roadmap', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/career-roadmap');

    await expect(
      page.getByRole('heading', { level: 1, name: /Engineering Path/i }),
    ).toBeVisible();
    // The visitor banner is the sign-in affordance that replaces every 401.
    await expect(page.getByText(/browsing as a visitor/i)).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Sign in to create a roadmap/i }),
    ).toHaveAttribute('href', /\/auth\/login\?callbackUrl=/);
  });

  test('GET /coding-challenges returns 200 with the catalogue page and a sign-in-to-solve affordance', async ({
    page,
  }) => {
    const res = await page.goto('/coding-challenges', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/coding-challenges');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Coding Challenges' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Sign in to solve/i }).first(),
    ).toHaveAttribute('href', /\/auth\/login\?callbackUrl=/);
  });

  test('GET /battles/demo returns 200 and plays the recorded battle without a socket', async ({
    page,
  }) => {
    const wsAttempts: string[] = [];
    page.on('websocket', (ws) => wsAttempts.push(ws.url()));

    const res = await page.goto('/battles/demo', {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/battles/demo');

    await expect(
      page.getByRole('heading', { level: 1, name: /recorded demo/i }),
    ).toBeVisible();
    // Labelled as a recording in the page body, not only in the title.
    await expect(page.getByRole('note')).toContainText('Recorded demo');

    // Prove hydration before touching the scrubber. domcontentloaded says
    // nothing about React being attached, and a range value written BEFORE
    // hydration is never seen afterwards either: React's input value tracker
    // ignores an input event whose value equals the last one it recorded, so
    // re-filling the same number later is a no-op. Pressing play until the
    // caption moves is the honest "the page is interactive" signal.
    // "Next event" rather than Play: stepping is idempotent under repeated
    // clicks, whereas polling Play toggles play/pause faster than the 1.6 s
    // tick and the replay never advances.
    const caption = page.getByTestId('replay-caption');
    const nextEvent = page.getByRole('button', { name: 'Next event' });
    await expect
      .poll(
        async () => {
          await nextEvent.click();
          return caption.innerText();
        },
        { timeout: 30_000 },
      )
      .not.toMatch(/Press play/i);

    // Scrub to the end: the final standings and the declared winner appear.
    const slider = page.getByRole('slider');
    const lastStep = await slider.getAttribute('max');
    expect(Number(lastStep)).toBeGreaterThan(0);
    await slider.fill(String(lastStep));
    await expect(caption).toContainText(/Battle complete/i);
    await expect(
      page.getByRole('heading', { level: 2, name: /Demo Player A wins/i }),
    ).toBeVisible();
    await expect(page.getByRole('list', { name: 'Standings' })).toContainText(
      '400 pts',
    );

    // Next's own HMR socket is the only one a dev server opens; the battle
    // socket (socket.io) must never be attempted from this page.
    expect(
      wsAttempts.filter((u) => /socket\.io/i.test(u)),
      'the recorded demo opened a battle socket',
    ).toEqual([]);
  });

  test('the challenge editor itself still redirects a visitor to login', async ({
    page,
  }) => {
    await page.goto('/coding-challenges/any-challenge-id', {
      waitUntil: 'domcontentloaded',
    });
    const url = new URL(page.url());
    expect(url.pathname).toBe('/auth/login');
    expect(url.searchParams.get('callbackUrl')).toBe(
      '/coding-challenges/any-challenge-id',
    );
  });

  test('anonymous /create-battle still redirects to login', async ({
    page,
  }) => {
    await page.goto('/create-battle', { waitUntil: 'domcontentloaded' });
    const url = new URL(page.url());
    expect(url.pathname).toBe('/auth/login');
    expect(url.searchParams.get('callbackUrl')).toBe('/create-battle');
  });
});
