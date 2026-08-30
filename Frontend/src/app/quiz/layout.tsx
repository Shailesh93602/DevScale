import type { Metadata } from 'next';

/**
 * A layout exists here only to carry `metadata`.
 *
 * page.tsx is a client component, and `export const metadata` is server-only —
 * exporting it there is silently ignored rather than an error, so the page would
 * ship with no noindex and nothing would say so. A server layout wrapping the
 * client page is the supported way to attach it.
 *
 * noindex, not a robots.txt Disallow: the crawler has to be allowed to FETCH
 * the page in order to read the tag telling it not to index. See app/robots.ts.
 */
export const metadata: Metadata = {
  title: 'Quiz',
  description: 'A small standalone quiz demo.',
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
