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
  // Public since 2026-09-03 (#36): the roadmap list and the challenge LIST are
  // readable signed out. They sat in the protected list below until
  // 2026-09-05, so the classification guard was red and — had it not been —
  // both would have been audited as a student only.
  { path: '/career-roadmap', name: 'career-roadmap' },
  { path: '/coding-challenges', name: 'coding-challenges' },
];

/**
 * Anonymously reachable but in NEITHER classification list, on purpose: the
 * three ComingSoon placeholders are unlinked, `noindex` (see robots.ts
 * NOINDEX_PATHS) and gate nothing, so the middleware's public fast path serves
 * them to anyone. They are audited like public pages; the guard below asserts
 * only what is true of them — that no session is required — rather than
 * forcing them into PUBLIC_ROUTE_PREFIXES, which feeds the sitemap.
 */
const placeholderRoutes = [
  { path: '/mastermind-forge', name: 'mastermind-forge' },
  { path: '/tech-pioneer', name: 'tech-pioneer' },
  { path: '/instant-battle', name: 'instant-battle' },
];

/**
 * Audited with the STUDENT session. `/admin` is deliberately absent: the
 * RoleGuard sends a student to /dashboard, so "admin (Protected)" was an audit
 * of the dashboard under another name — exactly the wrong-page failure the
 * URL assertion below now catches. Auditing the admin console needs an admin
 * session (E2E_ADMIN_PASSWORD); add it as its own list when that is wired.
 */
const protectedRoutes = [
  { path: '/community', name: 'community' },
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
  { path: '/create-battle', name: 'create-battle' },
  { path: '/create-resource', name: 'create-resource' },
];

/**
 * Wait until the page has LOADED and nothing is mid-fade, then let axe measure.
 *
 * WHY THIS EXISTS. axe reads COMPUTED colour, and an element still animating
 * its opacity reports its BLENDED colour — which fails a contrast check the
 * real palette passes comfortably. This suite was flaky in CI because of it:
 * `/about` and `/career-roadmap` each failed and then PASSED on retry, and `/`
 * failed all three attempts on a slow runner.
 *
 * WHY IT WAITS FOR THE DATA FIRST (added 2026-09-05). The previous version
 * polled only for "no inline opacity below 1" and returned the moment that was
 * true — which, on every page that fetches before it renders, is BEFORE the
 * data arrives: a skeleton is on screen and nothing is animating yet. The
 * fetched cards then faded in underneath axe. Node data from a 5x probe of
 * `/career-roadmap` and `/streak` under parallel load made it unambiguous:
 * the failing foregrounds were `#ebecec`, `#a8a9ab`, `#757b87` for text whose
 * token is `#616875` at rest, and the pulsing SiteLoader label at 2.08:1 —
 * every one a blend, never the palette. So the order is now: network quiet,
 * loading indicators gone, in-flight fades finished, CSS fade-up elapsed.
 *
 * WHY IT OBSERVES RATHER THAN OVERRIDES.
 *
 * The obvious fix is to force `opacity: 1` on every inline-styled element —
 * that is what portfolio_next does, and it works there. Applied here it made
 * things WORSE (a local run went from 3/3 green to 1 failure), because forcing
 * opacity reveals elements that are *legitimately* faded — a closed dropdown, a
 * disabled overlay — and axe then reports violations no user could encounter.
 *
 * So this waits instead of writing. Every wait is bounded and gives up rather
 * than hanging the suite; a give-up means axe measures one frame early, which
 * is a flaky failure, not a false pass. The in-flight predicate is "inline
 * opacity strictly between 0 and 1": an element parked at 0 (a `whileInView`
 * block below the fold) is not animating and axe ignores it, so it must not
 * hold the wait open — with `< 1` it did, for the full timeout, every time.
 */
async function settleAnimations(page: Page): Promise<void> {
  // 1. Let the fetches finish. `.catch` because a page holding a socket open
  //    never reaches networkidle, and that is not a failure of the page.
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => undefined);

  // 2. Loading UI gone: skeletons (`animate-pulse`), spinners (`animate-spin`)
  //    and the SiteLoader overlay. Tailwind's `pulse` oscillates opacity, so
  //    text inside a pulsing block reports a different colour every frame.
  await page
    .waitForFunction(
      () =>
        document.querySelectorAll('.animate-pulse, .animate-spin').length === 0,
      undefined,
      { timeout: 10000 },
    )
    .catch(() => undefined);

  // 3. framer-motion drives opacity through inline styles: anything strictly
  //    between 0 and 1 is a fade in progress.
  await page
    .waitForFunction(
      () =>
        !Array.from(
          document.querySelectorAll<HTMLElement>('[style*="opacity"]'),
        ).some((el) => {
          const opacity = Number(el.style.opacity);
          return opacity > 0 && opacity < 1;
        }),
      undefined,
      { timeout: 5000 },
    )
    .catch(() => undefined);

  // 4. CSS animations (globals.css `.fade-up`, 0.5s) are not inline-styled, so
  //    the poll above cannot see them. One short wait covers them.
  await page.waitForTimeout(600);
}

/**
 * Load the route and PROVE it is the page being audited.
 *
 * Eleven "public" routes once 302'd to the login page and axe reported eleven
 * passing pages; `/admin` audited as a student is a RoleGuard redirect to
 * /dashboard. Neither is caught by an axe result. So the response status and
 * the final URL are asserted before any scan: a redirect or an error page is
 * a failed audit of that route, not a clean one of some other page.
 */
async function openForAudit(page: Page, path: string): Promise<void> {
  const response = await page.goto(path, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  });
  expect(response?.status(), `${path} did not load`).toBeLessThan(400);
  const escaped = path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  await expect(
    page,
    `${path} redirected — axe would audit a different page`,
  ).toHaveURL(new RegExp(`${escaped}(?:[?#]|$)`));
  await settleAnimations(page);
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

  test('every "placeholder" route in this file is reachable without a session', () => {
    const gated = placeholderRoutes
      .map((r) => r.path)
      .filter((p) => requiresAuthRoute(p) || isGuestOnlyRoute(p));
    expect(gated).toEqual([]);
  });

  test('every "protected" route in this file actually requires auth', () => {
    const misclassified = protectedRoutes
      .map((r) => r.path)
      .filter((p) => !requiresAuthRoute(p));
    expect(misclassified).toEqual([]);
  });
});

async function auditForViolations(page: Page, label: string): Promise<void> {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('nextjs-portal')
    .analyze();

  console.log(
    `Page: ${label} - Violations: ${accessibilityScanResults.violations.length}`,
  );
  for (const v of accessibilityScanResults.violations) {
    // Rule, then each node with the computed colours axe used — without the
    // node data a contrast failure cannot be told apart from a mid-fade one.
    console.log(`[${label}] Violation: ${v.id} - ${v.help}`);
    for (const n of v.nodes) {
      console.log(
        `[${label}]   ${n.target.join(' ')} ${JSON.stringify(n.any[0]?.data ?? {})}`,
      );
    }
  }

  expect(accessibilityScanResults.violations).toEqual([]);
}

/** next-themes reads localStorage before paint; set it before the first navigation. */
async function setThemeBeforeLoad(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('theme', t as string);
    } catch {
      /* storage unavailable — the default theme is still a valid audit */
    }
  }, theme);
}

test.describe('Accessibility Audits', () => {
  for (const route of [...publicRoutes, ...placeholderRoutes]) {
    for (const theme of THEMES) {
      test(`${route.name} (Public, ${theme}) should pass WCAG AA guidelines`, async ({
        page,
      }) => {
        await setThemeBeforeLoad(page, theme);
        await openForAudit(page, route.path);
        await auditForViolations(page, `${route.name}/${theme}`);
      });
    }
  }

  // Both themes here too. The protected pages were light-only until
  // 2026-09-05, and `/streak` shipped `text-gray-500` captions — 4.83:1 on the
  // light card, ~3.6:1 on the dark one — for as long as that was true.
  for (const route of protectedRoutes) {
    for (const theme of THEMES) {
      test(`${route.name} (Protected, ${theme}) should pass WCAG AA guidelines`, async ({
        page,
      }) => {
        await setThemeBeforeLoad(page, theme);
        await loginAsStudent(page);
        await openForAudit(page, route.path);
        await auditForViolations(page, `${route.name}/${theme}`);
      });
    }
  }
});
