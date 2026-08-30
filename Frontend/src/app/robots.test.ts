import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import robots, { __testing, NOINDEX_PATHS } from './robots';
import { SITEMAP_PATHS } from './sitemap';
import { isPublicRoute } from '@/lib/public-routes';

const { DISALLOW, RETRIEVAL_BOTS, TRAINING_BOTS } = __testing;
const rules = robots().rules as Array<{
  userAgent?: string | string[];
  disallow?: string | string[];
}>;

const asList = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

describe('robots.txt', () => {
  it('blocks every auth-gated area', () => {
    for (const p of [
      '/dashboard/',
      '/admin/',
      '/profile/',
      '/settings/',
      '/auth/',
    ])
      expect(DISALLOW).toContain(p);
  });

  it('does not block anything the sitemap advertises', () => {
    // The two files disagreeing is the worst outcome of all: telling Google to
    // crawl a URL and forbidding it in the same breath.
    const blocked = SITEMAP_PATHS.filter((p) =>
      DISALLOW.some((d) => d !== '/' && p.startsWith(d.replace(/\/$/, ''))),
    );
    expect(blocked).toEqual([]);
  });

  it('never disallows the site root', () => {
    // A stray '/' in DISALLOW would deindex the entire site, and every other
    // assertion here would still pass.
    expect(DISALLOW).not.toContain('/');
  });

  it('leaves the genuinely public pages crawlable', () => {
    for (const p of ['/', '/about', '/blogs', '/faq', '/contact']) {
      expect(isPublicRoute(p)).toBe(true);
      expect(DISALLOW).not.toContain(p);
    }
  });

  /**
   * The important one.
   *
   * robots.txt group matching is winner-take-all: a crawler obeys only the most
   * specific group matching its user-agent and ignores `*` entirely. A named
   * group carrying `allow: '/'` and no disallows therefore GRANTS that bot the
   * whole site — the failure mode where adding AI-crawler rules to lock things
   * down quietly unlocks them instead.
   */
  it('every named user-agent group repeats the full disallow list', () => {
    const named = rules.filter((r) => r.userAgent !== '*');
    expect(named.length).toBeGreaterThan(0);
    for (const rule of named) {
      expect(asList(rule.disallow).sort()).toEqual([...DISALLOW].sort());
    }
  });

  it('names both retrieval and training crawlers', () => {
    const covered = rules.flatMap((r) => asList(r.userAgent));
    for (const bot of [...RETRIEVAL_BOTS, ...TRAINING_BOTS])
      expect(covered).toContain(bot);
  });

  /**
   * The noindex list is only a comment unless the pages actually carry the tag.
   *
   * Read from disk rather than imported: three of these pages are client
   * components, where `export const metadata` is SILENTLY IGNORED by Next
   * rather than erroring. That is the failure this checks for — a page that
   * looks correct in review, ships with no robots tag, and says nothing.
   */
  it('every noindex path really carries robots.index=false', () => {
    for (const path of NOINDEX_PATHS) {
      const dir = join(process.cwd(), 'src/app', path);
      const page = join(dir, 'page.tsx');
      const layout = join(dir, 'layout.tsx');
      expect(existsSync(page), `${path}/page.tsx missing`).toBe(true);

      const pageSrc = readFileSync(page, 'utf8');
      const isClient = /^['"]use client['"]/m.test(pageSrc);

      // A client page cannot carry metadata at all, so it MUST have a server
      // layout beside it doing the job.
      const carrier = isClient ? layout : page;
      expect(
        existsSync(carrier),
        `${path} is a client component and needs a layout.tsx to hold metadata`,
      ).toBe(true);

      const src = readFileSync(carrier, 'utf8');
      expect(src, `${path} has no robots metadata`).toMatch(
        /robots:\s*\{[^}]*index:\s*false/,
      );
      // metadata in a client component is dead code; catch it here.
      expect(
        /^['"]use client['"]/m.test(src),
        `${carrier} must be a server file`,
      ).toBe(false);
    }
  });
});
