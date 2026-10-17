import { describe, it, expect, vi } from 'vitest';

const h = vi.hoisted(() => ({ redirect: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: h.redirect }));

import ArticleListingPage from './page';
import { SITEMAP_PATHS } from '../sitemap';

describe('/article-listing', () => {
  it('sends visitors to the role-gated moderation queue', () => {
    ArticleListingPage();
    expect(h.redirect).toHaveBeenCalledWith('/moderate');
  });

  it('is not offered to crawlers', () => {
    expect(SITEMAP_PATHS).not.toContain('/article-listing');
  });
});
