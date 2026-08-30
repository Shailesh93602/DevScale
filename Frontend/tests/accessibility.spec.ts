import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsStudent } from './utils/login';
import {
  isPublicRoute,
  isGuestOnlyRoute,
  requiresAuthRoute,
} from '../src/lib/public-routes';

/**
 * ELEVEN of the routes listed here were not public.
 *
 * `/career-roadmap`, `/community`, `/coding-challenges`,
 * `/placement-preparation`, `/resources`, `/discussion-forums`, `/events`,
 * `/collaboration-opportunities`, `/discussions`, `/member-highlights` and
 * `/tech-interests-assessment` are all in AUTH_REQUIRED_ROUTE_PREFIXES, so an
 * anonymous visit 302s to `/auth/login`. Axe dutifully scanned the LOGIN PAGE
 * eleven times over and reported eleven passing routes.
 *
 * The assertions were never the weak part — the input set was, exactly as in
 * the sibling repo's admin-route contract test. The guard test below now
 * derives the truth from `public-routes.ts` so this list cannot drift again.
 */
const publicRoutes = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/auth/forgot-password', name: 'forgot-password' },
  { path: '/auth/verify-email', name: 'verify-email' },
  { path: '/blogs', name: 'blogs' },
  { path: '/faq', name: 'faq' },
  { path: '/contact', name: 'contact' },
  { path: '/interview-question', name: 'interview-question' },
  { path: '/article-listing', name: 'article-listing' },
];

const protectedRoutes = [
  { path: '/career-roadmap', name: 'career-roadmap' },
  { path: '/community', name: 'community' },
  { path: '/coding-challenges', name: 'coding-challenges' },
  { path: '/placement-preparation', name: 'placement-prep' },
  { path: '/resources', name: 'resources' },
  { path: '/discussion-forums', name: 'discussion-forums' },
  { path: '/tech-interests-assessment', name: 'tech-assessment' },
  { path: '/events', name: 'events' },
  { path: '/collaboration-opportunities', name: 'collaboration' },
  { path: '/discussions', name: 'discussions' },
  { path: '/member-highlights', name: 'member-highlights' },
  { path: '/battle-zone', name: 'battle-zone' },
  { path: '/doubts', name: 'doubts' },
  { path: '/achievements', name: 'achievements' },
  { path: '/streak', name: 'streak' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/profile', name: 'profile' },
  { path: '/admin', name: 'admin' },
  { path: '/mastermind-forge', name: 'mastermind-forge' },
  { path: '/tech-pioneer', name: 'tech-pioneer' },
  { path: '/instant-battle', name: 'instant-battle' },
  { path: '/create-battle', name: 'create-battle' },
  { path: '/create-resource', name: 'create-resource' },
];

/**
 * Wait until nothing is mid-fade, then let axe measure.
 *
 * WHY THIS EXISTS. axe reads COMPUTED colour, and an element still animating
 * its opacity reports its BLENDED colour — which fails a contrast check the
 * real palette passes comfortably. This suite was flaky in CI because of it:
 * `/about` and `/career-roadmap` each failed and then PASSED on retry, and `/`
 * failed all three attempts on a slow runner.
 *
 * WHY IT OBSERVES RATHER THAN OVERRIDES.
 *
 * The obvious fix is to force `opacity: 1` on every inline-styled element —
 * that is what portfolio_next does, and it works there. Applied here it made
 * things WORSE (a local run went from 3/3 green to 1 failure), because forcing
 * opacity reveals elements that are *legitimately* faded — a closed dropdown, a
 * disabled overlay — and axe then reports violations no user could encounter.
 *
 * So this waits instead of writing. It polls for the absence of an in-flight
 * fade and never mutates the page, which means it cannot manufacture a
 * violation. framer-motion drives opacity through inline styles, so an inline
 * `opacity` below 1 is precisely the signal that something is still animating.
 *
 * The timeout is a deliberate give-up: an element that is *permanently* faded
 * will never satisfy the predicate, and hanging the suite would be a worse
 * failure than measuring one frame early. Two seconds is far longer than any
 * animation here.
 */
async function settleAnimations(page: Page): Promise<void> {
  await page
    .waitForFunction(
      () =>
        !Array.from(document.querySelectorAll<HTMLElement>('[style]')).some(
          (el) => {
            const opacity = el.style.opacity;
            return opacity !== '' && Number(opacity) < 1;
          },
        ),
      undefined,
      { timeout: 2000 },
    )
    .catch(() => undefined);

  // CSS animations (globals.css `fadeUp`) are not inline-styled, so the poll
  // above cannot see them. One short wait covers them; `fadeUp` is 0.5s.
  await page.waitForTimeout(600);
}

/**
 * BOTH themes, deliberately.
 *
 * This suite ran with no theme set, so it only ever measured light mode — and
 * dark mode shipped with the brand purple unchanged from :root, giving 2.40:1
 * on the dark background. That is below the 3.0 floor for LARGE text, and it
 * was the colour of the 72px home H1, every section heading, and every
 * "Learn more" link on the site.
 *
 * The blind spot was not the assertions, which are strict — it was the input
 * set. A theme-able site audited in one theme is audited in half of itself.
 */
const THEMES = ['light', 'dark'] as const;

test.describe('route classification', () => {
  test('every "public" route in this file is actually public', () => {
    // Derived from the app's own route classification rather than restated,
    // because a hand-maintained list is what produced eleven audits of the
    // login page while reporting eleven passing pages.
    const misclassified = publicRoutes
      .map((r) => r.path)
      .filter((p) => !isPublicRoute(p) && !isGuestOnlyRoute(p));
    expect(misclassified).toEqual([]);
  });

  test('every "protected" route in this file actually requires auth', () => {
    const misclassified = protectedRoutes
      .map((r) => r.path)
      .filter((p) => !requiresAuthRoute(p));
    expect(misclassified).toEqual([]);
  });
});

test.describe('Accessibility Audits', () => {
  for (const route of publicRoutes) {
    for (const theme of THEMES) {
      test(`${route.name} (Public, ${theme}) should pass WCAG AA guidelines`, async ({
        page,
      }) => {
        // next-themes reads localStorage before paint, so set it before the
        // first navigation rather than toggling afterwards and re-measuring.
        await page.addInitScript((t) => {
          try {
            localStorage.setItem('theme', t as string);
          } catch {
            /* storage unavailable — the default theme is still a valid audit */
          }
        }, theme);

        await page.goto(route.path, {
          waitUntil: 'domcontentloaded',
          timeout: 45000,
        });
        await settleAnimations(page);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude('nextjs-portal')
          .analyze();

        console.log(
          `Page: ${route.path} [${theme}] - Violations: ${accessibilityScanResults.violations.length}`,
        );

        if (accessibilityScanResults.violations.length > 0) {
          accessibilityScanResults.violations.forEach((v) => {
            console.log(
              `[${route.name}/${theme}] Violation: ${v.id} - ${v.help}`,
            );
          });
        }

        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  }

  for (const route of protectedRoutes) {
    test(`${route.name} (Protected) should pass WCAG AA guidelines`, async ({
      page,
    }) => {
      // Login first
      await loginAsStudent(page);

      // Navigate to protected route
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await settleAnimations(page);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('nextjs-portal')
        .analyze();

      console.log(
        `Page: ${route.path} - Violations: ${accessibilityScanResults.violations.length}`,
      );

      if (accessibilityScanResults.violations.length > 0) {
        // Log details for debugging
        accessibilityScanResults.violations.forEach((v) => {
          console.log(`[${route.name}] Violation: ${v.id} - ${v.help}`);
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
