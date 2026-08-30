import type { Metadata } from 'next';

/**
 * The error page must never be indexed.
 *
 * It returns 200 to an anonymous crawler and carries no robots tag, so it was
 * indexable — and an error page ranking for the site's own name is the worst
 * possible search result. Not a robots.txt Disallow: the page has to stay
 * crawlable for the tag to be read. See app/robots.ts for that split.
 */
export const metadata: Metadata = {
  title: 'Error',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
