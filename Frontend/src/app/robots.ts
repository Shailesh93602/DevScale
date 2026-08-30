import type { MetadataRoute } from 'next';
import {
  AUTH_REQUIRED_ROUTE_PREFIXES,
  GUEST_ONLY_ROUTE_PREFIXES,
} from '@/lib/public-routes';

const BASE = 'https://eduscale.vercel.app';

/**
 * Paths no crawler should spend budget on, derived rather than typed out.
 *
 * Previously this file said `{ userAgent: '*', allow: '/' }` and nothing else,
 * so every auth-gated route was offered to crawlers. Each one 302s to
 * /auth/login, which means Google saw ~24 distinct URLs all resolving to the
 * same page — wasted crawl budget plus a duplicate-content signal pointing at
 * the one page that should never rank.
 *
 * Derived from the route classifier for the same reason the sitemap is: the
 * hand-maintained version of this list drifted the moment a route changed side.
 */
const GATED = [...AUTH_REQUIRED_ROUTE_PREFIXES, ...GUEST_ONLY_ROUTE_PREFIXES]
  .map((p) => `${p}/`)
  .sort();

/**
 * Pages that should not be INDEXED are deliberately NOT listed here.
 *
 * Disallow and noindex cancel each other out. A disallowed URL is never
 * fetched, so its `noindex` is never read, and Google keeps showing the URL
 * (title-less) if anything links to it — the page stays in the index and
 * becomes un-removable, which is the opposite of the intent.
 *
 * So the two tools are split by purpose, and the split is the whole point:
 *   - Disallow  -> auth-gated routes. Already 302 to /auth/login, so there is
 *                  nothing to index; this only reclaims crawl budget.
 *   - noindex   -> thin pages (/quiz, /sentry-example-page and the three
 *                  ComingSoon placeholders). They stay crawlable ON PURPOSE,
 *                  because the crawler has to read the page to obey the tag.
 * See NOINDEX_PATHS below and the `robots` metadata on each of those pages.
 */
const DISALLOW = ['/api/', ...GATED];

/**
 * Crawlable but not indexable — unlinked demo scaffolding and honest "coming
 * soon" placeholders. /quiz is a two-question hardcoded demo ("What is the
 * capital of France?"); landing on it from a search result makes a finished
 * project look unfinished. Enforced by `robots: { index: false }` in each
 * page's metadata; listed here so one test can check they agree.
 */
export const NOINDEX_PATHS = [
  '/error',
  '/quiz',
  '/sentry-example-page',
  '/instant-battle',
  '/mastermind-forge',
  '/tech-pioneer',
];

/**
 * AI crawlers are listed explicitly, in two groups, for a reason worth stating.
 *
 * robots.txt group matching is winner-take-all: a bot obeys the MOST SPECIFIC
 * group whose user-agent matches it and ignores every other group, including
 * `*`. So naming a crawler and giving it only `allow: '/'` would hand it the
 * whole site — the exact opposite of the intent. Every group below therefore
 * repeats DISALLOW. This is the classic way a robots.txt "tightening" ends up
 * loosening things.
 *
 * Both groups are allowed. The site's goal is to be found and cited; the
 * distinction is kept because the two behave differently and the day the
 * training-vs-retrieval decision needs to diverge, the structure is already
 * here rather than needing to be reasoned out again.
 *
 * - RETRIEVAL bots fetch a page to answer a live question and cite it. These
 *   are the ones that matter for showing up in AI answers at all.
 * - TRAINING bots collect corpus. Blocking them removes nothing from today's
 *   answers, but also forfeits any long-run presence in model weights.
 */
const RETRIEVAL_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
];

const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'CCBot', 'Applebot-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      { userAgent: RETRIEVAL_BOTS, allow: '/', disallow: DISALLOW },
      { userAgent: TRAINING_BOTS, allow: '/', disallow: DISALLOW },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}

export const __testing = { DISALLOW, RETRIEVAL_BOTS, TRAINING_BOTS };
