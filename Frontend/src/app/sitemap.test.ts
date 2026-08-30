import { describe, it, expect } from 'vitest';
import { SITEMAP_PATHS } from './sitemap';
import { isPublicRoute, isGuestOnlyRoute } from '@/lib/public-routes';

/**
 * A sitemap must only advertise pages an anonymous crawler can load.
 *
 * The previous version was a hand-maintained list under a comment promising
 * that auth-gated routes were "intentionally excluded". Eight of its fifteen
 * entries redirected to /auth/login — a majority-wrong sitemap, which is worse
 * than none: Search Console reports every one as "Page with redirect", they
 * consume crawl budget, and eight URLs resolving to the same login page is a
 * duplicate-content signal for the one page nobody should rank for.
 *
 * The list is now derived from the app's own route classifier, so this test is
 * the thing that keeps the derivation honest if someone reintroduces a literal.
 */
describe('sitemap advertises only crawlable pages', () => {
  it('has entries', () => {
    // Load-bearing: an empty list would satisfy every assertion below.
    expect(SITEMAP_PATHS.length).toBeGreaterThan(3);
  });

  it('every path is public', () => {
    const notPublic = SITEMAP_PATHS.filter((p) => !isPublicRoute(p));
    expect(notPublic).toEqual([]);
  });

  it('no guest-only route is advertised', () => {
    // /auth/* pages redirect signed-in users away, so they are not a stable
    // destination for a crawler either.
    expect(SITEMAP_PATHS.filter((p) => isGuestOnlyRoute(p))).toEqual([]);
  });

  it('the routes that used to redirect are gone', () => {
    // Named explicitly: these eight were the actual defect, and a regression
    // should say so rather than just failing a generic filter.
    const previouslyWrong = [
      '/articles',
      '/career-roadmap',
      '/coding-challenges',
      '/community',
      '/discussions',
      '/discussion-forums',
      '/events',
      '/achievements',
    ];
    const stillThere = previouslyWrong.filter((p) => SITEMAP_PATHS.includes(p));
    expect(stillThere).toEqual([]);
  });

  it('still advertises the genuinely public pages', () => {
    // The opposite failure — over-filtering to an empty-ish sitemap — would
    // also pass every check above.
    for (const p of ['/', '/about', '/blogs', '/contact', '/faq']) {
      expect(SITEMAP_PATHS).toContain(p);
    }
  });
});
