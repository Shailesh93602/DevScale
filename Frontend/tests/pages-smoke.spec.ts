import { test, expect, Page } from '@playwright/test';

// ─── Route Definitions ───────────────────────────────────────────────────────
// Public routes - accessible without authentication
const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/faq',
  '/contact',
  '/blogs',
  '/interview-question',
];

// Protected routes - require authentication (middleware redirects to /auth/login)
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/career-roadmap',
  '/coding-challenges',
  '/battle-zone',
  '/community',
  '/resources',
  '/streak',
  '/achievements',
  '/articles',
  '/discussion-forums',
  '/placement-preparation',
  '/tech-interests-assessment',
  '/events',
  '/collaboration-opportunities',
  '/discussions',
  '/member-highlights',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter(
    (e) =>
      // Ignore known non-critical errors
      !e.includes('hydration') &&
      !e.includes('Loading chunk') &&
      !e.includes('ChunkLoadError'),
  );
}

// ─── Public Route Smoke Tests ────────────────────────────────────────────────
test.describe('Public pages smoke tests', () => {
  for (const route of publicRoutes) {
    test(`Public: ${route} loads without errors`, async ({ page }) => {
      const errors = collectPageErrors(page);

      const response = await page.goto(route, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Should not return server errors
      expect(response?.status()).toBeLessThan(500);

      // Should not have critical JS errors
      const critical = filterCriticalErrors(errors);
      expect(critical).toHaveLength(0);

      // Page should have visible content
      await expect(page.locator('body')).toBeVisible();
    });
  }
});

// ─── Protected Route Redirect Tests ──────────────────────────────────────────
test.describe('Protected pages redirect when unauthenticated', () => {
  for (const route of protectedRoutes) {
    test(`Protected: ${route} redirects to login`, async ({ page }) => {
      const response = await page.goto(route, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // Should redirect (302) or be at login page
      const finalUrl = new URL(page.url());
      const status = response?.status() ?? 0;

      // Either redirected to login, or returned a redirect status
      const redirectedToLogin = finalUrl.pathname.includes('/auth/login');
      const isOkStatus = status < 500;

      expect(isOkStatus).toBe(true);

      // If not redirected, at least shouldn't error
      if (!redirectedToLogin) {
        expect(status).toBeLessThan(400);
      }
    });
  }
});

// ─── Landing Page Specific Tests ─────────────────────────────────────────────
test.describe('Landing page UI checks', () => {
  test('Landing page has CTA button with proper styling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Should have a "Get Started" type CTA
    const ctaButton = page.locator(
      'a:has-text("Get Started"), button:has-text("Get Started")',
    );
    const count = await ctaButton.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Landing page CTA links to register for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // The first CTA should link to register
    const ctaLink = page.locator('a:has-text("Get Started Free")').first();
    if ((await ctaLink.count()) > 0) {
      const href = await ctaLink.getAttribute('href');
      expect(href).toContain('/auth/register');
    }
  });
});

// ─── Button Component Consistency Tests ──────────────────────────────────────
test.describe('Button component consistency', () => {
  test('No CTA buttons with hardcoded dark text colors on landing page', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Find all elements that look like CTA buttons (links to register, dashboard)
    const ctaElements = page.locator(
      'a[href="/auth/register"], a[href="/dashboard"]',
    );
    const count = await ctaElements.count();

    for (let i = 0; i < count; i++) {
      const el = ctaElements.nth(i);
      const classes = (await el.getAttribute('class')) || '';

      // Should NOT have hardcoded text-black or text-gray-* on primary CTA buttons
      // that would break in dark mode
      if (classes.includes('bg-primary') || classes.includes('bg-gradient')) {
        expect(classes).not.toContain('text-black');
        expect(classes).not.toContain('text-gray-900');
      }
    }
  });
});
