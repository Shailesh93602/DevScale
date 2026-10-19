import { test, expect, type APIRequestContext } from '@playwright/test';

// Asserts the SERVED HTML and text files, so it can run against `next start` or the live site.
const ldBlocks = (html: string): Record<string, unknown>[] =>
  [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => JSON.parse(m[1]) as Record<string, unknown>);

async function get(request: APIRequestContext, path: string) {
  const res = await request.get(path, { maxRedirects: 0 });
  return {
    status: res.status(),
    headers: res.headers(),
    body: await res.text(),
  };
}

test.describe('served SEO surfaces', () => {
  test('/pricing serves WebApplication JSON-LD whose offer matches the visible price', async ({
    request,
  }) => {
    const { status, body } = await get(request, '/pricing');
    expect(status).toBe(200);
    const app = ldBlocks(body).find((b) => b['@type'] === 'WebApplication');
    expect(app, 'no WebApplication JSON-LD on /pricing').toBeDefined();
    const offers = app!.offers as Record<string, string>;
    expect(offers.priceCurrency).toBe('USD');
    expect(body).toContain(`>$${offers.price}<`);
    for (const f of app!.featureList as string[]) expect(body).toContain(f);
    expect(JSON.stringify(app)).not.toMatch(/aggregateRating|ratingValue/);
  });

  test('every sitemap URL is a 200 that declares itself canonical', async ({
    request,
  }) => {
    const { body: xml } = await get(request, '/sitemap.xml');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urls.length).toBeGreaterThan(5);
    for (const url of urls) {
      const path = new URL(url).pathname;
      const { status, body } = await get(request, path);
      expect(status, path).toBe(200);
      const canonical = /<link rel="canonical" href="([^"]+)"/.exec(body)?.[1];
      expect(canonical && new URL(canonical).pathname, path).toBe(path);
    }
  });

  test('/llms.txt links only pages that load without a redirect', async ({
    request,
  }) => {
    const { status, body } = await get(request, '/llms.txt');
    expect(status).toBe(200);
    const paths = [
      ...body.matchAll(/https:\/\/eduscale\.vercel\.app(\/[^\s)]*)/g),
    ].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(5);
    for (const p of paths) expect((await get(request, p)).status, p).toBe(200);
  });

  test('robots.txt lets AI retrieval crawlers read public pages', async ({
    request,
  }) => {
    const { body } = await get(request, '/robots.txt');
    for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot']) {
      const group = body.split(/\n\s*\n/).find((g) => g.includes(bot));
      expect(group, bot).toBeDefined();
      expect(group).toMatch(/Allow: \/\n/);
      expect(group).not.toMatch(/Disallow: \/\n/);
    }
  });

  test('retired pages are real 308s, not 200 shells', async ({ request }) => {
    for (const [from, to] of [
      ['/explore', '/career-roadmap'],
      ['/article-listing', '/moderate'],
    ]) {
      const { status, headers } = await get(request, from);
      expect(status, from).toBe(308);
      expect(headers.location, from).toBe(to);
    }
  });
});
