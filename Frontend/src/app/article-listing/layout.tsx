import type { Metadata } from 'next';
import type React from 'react';

/**
 * Metadata for a `'use client'` page.
 *
 * `export const metadata` is a SERVER-only export, so a client page cannot
 * carry it — which is exactly why `/article-listing` had none and inherited the generic
 * root title. Every such page shared one browser-tab label, one bookmark name
 * and one history entry, which is worse for a person with several tabs open
 * than it is for search engines.
 *
 * A thin server layout is the least invasive fix: the page stays a client
 * component and the title becomes real. The root layout supplies the
 * "%s | EduScale" template, so only the leaf name belongs here.
 */
export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse articles contributed to EduScale.',
};

export default function ArticleListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
