import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { test, expect } from '@playwright/test';

/**
 * Every internal link target declared in source must resolve to a real route.
 *
 * WHY THIS EXISTS.
 *
 * The Navbar profile menu linked to `/settings`. `src/app/settings` does not
 * exist, so every user who opened that menu and clicked Settings got a 404 —
 * and it was found by a human clicking around, not by any of the 30 spec files
 * in this directory.
 *
 * The reason none of them caught it is the interesting part. Suites here — and
 * in the sibling portfolio repo — build their route inventory from a constants
 * file and then assert those routes work. That can only ever verify what is
 * already declared correct. **A link pointing somewhere that does not exist is
 * invisible to a test that starts from the list of places that do.**
 *
 * So this test goes the other way: it takes every `/path` that source code
 * hands to a link, and asks the filesystem whether that route exists. No server,
 * no auth, no backend — which also means it cannot be flaky, and it runs in
 * milliseconds.
 *
 * WHAT IT DELIBERATELY DOES NOT COVER: a route that exists and renders badly.
 * That needs a browser and is a different test. This one closes the specific
 * hole that let /settings ship.
 */

const APP_DIR = join(process.cwd(), 'src', 'app');

/** Route groups `(name)` and private folders `_name` are not URL segments. */
function isSegmentFolder(name: string): boolean {
  return (
    !name.startsWith('_') && !name.startsWith('(') && !name.startsWith('.')
  );
}

/**
 * Every URL path the App Router can serve, derived from the directory tree.
 *
 * Dynamic segments become `*`, so `/u/[username]` is stored as `/u/*` and any
 * concrete `/u/anything` matches it.
 */
function collectRoutes(dir: string, prefix = ''): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;

  const entries = readdirSync(dir);
  const hasPage = entries.some((e) => /^page\.(tsx?|jsx?|mdx)$/.test(e));
  if (hasPage) out.push(prefix === '' ? '/' : prefix);

  for (const entry of entries) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory() || !isSegmentFolder(entry)) continue;

    // `[id]`, `[...slug]`, `[[...slug]]` all match any single-or-more segment.
    const segment = entry.startsWith('[') ? '*' : entry;
    out.push(...collectRoutes(full, `${prefix}/${segment}`));
  }
  return out;
}

function routeMatches(target: string, routes: string[]): boolean {
  const targetParts = target.split('/').filter(Boolean);

  return routes.some((route) => {
    const routeParts = route.split('/').filter(Boolean);
    // A catch-all route matches any deeper path.
    if (!routeParts.includes('*') && routeParts.length !== targetParts.length) {
      return false;
    }
    if (routeParts.length > targetParts.length) return false;
    return routeParts.every(
      (part, i) => part === '*' || part === targetParts[i],
    );
  });
}

/**
 * Remove `//` and block comments so prose about a path is not mistaken for a
 * link to it.
 *
 * Deliberately naive: it does not parse the language, so a `//` inside a string
 * literal would be over-trimmed. That direction is safe here — the worst case
 * is scanning less, and this test's job is to flag what it *does* see, not to
 * guarantee it sees everything. A parser would be more correct and far more
 * machinery than a link check warrants.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/** Source files that declare navigation targets. */
function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      out.push(...sourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Paths that are real but have no folder in src/app.
 *
 * Kept explicit and short. Anything added here is a claim that a route exists
 * outside the App Router, and it should be obvious enough to defend.
 */
const NON_APP_ROUTER_PATHS = new Set<string>([
  '/sitemap.xml',
  '/robots.txt',
  '/manifest.webmanifest',
]);

/** Matches `href="/x"`, `path: '/x'`, `router.push('/x')` and friends. */
const LINK_PATTERN =
  /(?:href|path|to|url|route|redirect|pathname)\s*[:=]\s*['"`](\/[a-zA-Z0-9\-_/[\]().]*)['"`]/g;
const PUSH_PATTERN =
  /(?:router\.(?:push|replace)|redirect|navigate)\s*\(\s*['"`](\/[a-zA-Z0-9\-_/[\]().]*)['"`]/g;

test.describe('internal links resolve to real routes', () => {
  test('every /path declared in source has a matching App Router route', () => {
    const routes = collectRoutes(APP_DIR);
    expect(
      routes.length,
      'no routes discovered — the App Router layout must have changed',
    ).toBeGreaterThan(10);

    const broken: string[] = [];
    const seen = new Set<string>();

    for (const file of sourceFiles(join(process.cwd(), 'src'))) {
      // Comments are stripped before scanning. Without this, a comment
      // explaining that a path was REMOVED — "was router.replace('/follow')" —
      // is read as a live link and the test reports the very bug it just
      // verified as fixed. Found exactly that way.
      const src = stripComments(readFileSync(file, 'utf8'));
      const rel = file.replace(process.cwd() + '/', '');

      for (const pattern of [LINK_PATTERN, PUSH_PATTERN]) {
        pattern.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(src)) !== null) {
          const target = m[1].split('?')[0].split('#')[0];

          // Template placeholders and API paths are not page routes.
          if (target.includes('${') || target.includes('{{')) continue;
          if (target.startsWith('/api/')) continue;
          if (NON_APP_ROUTER_PATHS.has(target)) continue;

          // Static assets served from public/ — `/avatars/02.png` is a file,
          // not a route. Matched by extension rather than by directory so a new
          // asset folder does not need registering here.
          if (/\.[a-z0-9]{2,5}$/i.test(target)) continue;

          // Socket.IO's transport path. Not a page, and not something the App
          // Router serves.
          if (target === '/socket.io' || target.startsWith('/socket.io/'))
            continue;

          const key = `${target} (${rel})`;
          if (seen.has(key)) continue;
          seen.add(key);

          if (!routeMatches(target, routes)) broken.push(key);
        }
      }
    }

    expect(
      broken,
      `These links point at routes that do not exist. Either build the page or ` +
        `remove the link — a 404 reached from the app's own navigation is worse ` +
        `than a missing feature, because it looks like something is broken.`,
    ).toEqual([]);
  });
});
