import type { MetadataRoute } from 'next';
import { isPublicRoute, isGuestOnlyRoute } from '@/lib/public-routes';

const BASE = 'https://eduscale.vercel.app';

/**
 * Candidate routes for the sitemap.
 *
 * WHY EVERY ENTRY IS FILTERED BELOW RATHER THAN TRUSTED.
 *
 * This list used to be the sitemap, under a comment promising that "auth-gated
 * routes are intentionally excluded". Eight of its fifteen entries were
 * auth-gated: /articles, /career-roadmap, /coding-challenges, /community,
 * /discussions, /discussion-forums, /events and /achievements all sit in
 * AUTH_REQUIRED_ROUTE_PREFIXES, so an anonymous crawler received a 302 to
 * /auth/login.
 *
 * A majority-wrong sitemap is worse than no sitemap. Search Console reports
 * those as "Page with redirect", they burn crawl budget, and eight distinct
 * URLs all resolving to the same login page is a duplicate-content signal
 * pointing at the one page nobody should be ranking for.
 *
 * The fix is not to prune the list by hand — it drifted once and would drift
 * again the next time a route changed side. `isPublicRoute` is the app's own
 * classifier, the same one the middleware enforces, so the sitemap and the
 * redirect behaviour now cannot disagree. sitemap.test.ts fails if they do.
 */
const CANDIDATE_PATHS = [
  '/',
  '/about',
  '/articles',
  '/article-listing',
  '/blogs',
  '/career-roadmap',
  '/coding-challenges',
  '/community',
  '/contact',
  '/discussions',
  '/discussion-forums',
  '/events',
  '/explore',
  '/faq',
  '/achievements',
  // Both are anonymously reachable and were simply never listed. Found by
  // curling every route against a production server rather than by reading the
  // code — the filter below was correct, the candidate list was short.
  '/interview-question',
  '/pricing',
  // Anonymous read-only view (2026-09-03): the roadmap list and the challenge
  // list are public now, and /battles/demo is a static recorded replay.
  '/battles/demo',
];

/** Only routes an anonymous crawler can actually load. */
export const SITEMAP_PATHS = CANDIDATE_PATHS.filter(
  (p) => isPublicRoute(p) && !isGuestOnlyRoute(p),
);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return SITEMAP_PATHS.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === '/' ? 'weekly' : 'monthly',
    priority: p === '/' ? 1.0 : 0.7,
  }));
}
