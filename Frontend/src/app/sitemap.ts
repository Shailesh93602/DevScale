import type { MetadataRoute } from 'next';

const BASE = 'https://eduscale.vercel.app';

// Public, crawlable EduScale routes. Auth-gated routes (dashboard, admin,
// /create-*, /edit-*, /collaboration-opportunities, /doubts) are
// intentionally excluded from the sitemap.
const PUBLIC_PATHS = [
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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === '/' ? 'weekly' : 'monthly',
    priority: p === '/' ? 1.0 : 0.7,
  }));
}
