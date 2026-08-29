import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * SEO invariants for the root layout.
 *
 * These are asserted against the SOURCE rather than a rendered tree, because
 * what matters is that the values are derived rather than literal — and a
 * rendered snapshot in a test environment would happily show a correct-looking
 * URL while production shipped a hardcoded one.
 *
 * The bug that prompted this: `<link rel="preconnect" href="http://localhost:4000" />`
 * was hardcoded in the root layout and SHIPPED. Every visitor to the production
 * site was told to preconnect to their own machine, over plain http, from an
 * https page — verified live before it was fixed. It appears in view-source,
 * wastes a connection attempt, and is exactly the kind of detail someone
 * reading the source draws conclusions from.
 */

/**
 * Comments are stripped first.
 *
 * A comment explaining why something is absent contains the very words that
 * prove it absent — the note "no `logo` and no `sameAs`" made the assertion
 * below fail against code that was correct. This is the third harness in this
 * workspace to need this: link-integrity flagged a path named only in a
 * comment, and user-facing-messages flagged a quoted example.
 *
 * A source-reading test must read code, not prose about code.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const layout = stripComments(
  readFileSync(join(process.cwd(), 'src', 'app', 'layout.tsx'), 'utf8'),
);

describe('root layout SEO', () => {
  it('never hardcodes localhost', () => {
    // The literal that shipped. Nothing in a root layout should name a dev
    // machine — not a preconnect, not an API base, not a canonical.
    expect(layout).not.toMatch(/localhost:\d+["']/);
  });

  it('sets metadataBase, so relative OG images resolve to absolute URLs', () => {
    // Without it Next.js warns at build time and emits a RELATIVE og:image,
    // which every social scraper then fails to fetch. The symptom is a missing
    // preview card, which nobody reports as a bug.
    expect(layout).toMatch(/metadataBase:\s*new URL\(/);
  });

  it('declares a canonical URL', () => {
    expect(layout).toMatch(/alternates:\s*\{\s*canonical:/);
  });

  it('emits JSON-LD structured data', () => {
    // Answer engines read JSON-LD to decide what a site IS. Without it they
    // infer from prose, and they infer badly.
    expect(layout).toMatch(/application\/ld\+json/);
    expect(layout).toMatch(/schema\.org/);
  });

  it('derives the site origin instead of repeating a literal', () => {
    expect(layout).toMatch(/NEXT_PUBLIC_SITE_URL/);
  });

  it('claims no logo or social profiles it does not have', () => {
    // Both would improve how a search result renders, and both would be
    // inventions: there is no brand logo asset and no social profiles that
    // belong to this project. Structured data is read by machines that do not
    // forgive invention, and a wrong sameAs is a claim about somebody else's
    // account.
    const ld = layout.slice(layout.indexOf('structuredData'));
    expect(ld).not.toMatch(/sameAs/);
    expect(ld).not.toMatch(/"logo"|logo:/);
  });
});
