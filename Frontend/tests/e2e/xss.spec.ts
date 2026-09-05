import { test, expect, Page } from '@playwright/test';
import {
  login,
  apiAs,
  settle,
  fixtureChallenge,
  fixtureTopicId,
  FIXTURE_XSS_CHALLENGE,
} from './helpers';

/**
 * ED-1 — "ReactMarkdown renders challenge description / editorial / hints and
 * article content unsanitised."
 *
 * That claim covers two DIFFERENT rendering paths, so it is tested as two:
 *
 *  1. <ReactMarkdown> — challenge description / formats / editorial.
 *     react-markdown v10 does not render raw HTML unless `rehype-raw` is added
 *     (it is not), and its default urlTransform strips `javascript:` hrefs. The
 *     payload should therefore come out as inert text.
 *
 *  2. dangerouslySetInnerHTML + client-side DOMPurify — article and resource
 *     bodies. DOMPurify returns its input UNCHANGED when no DOM is available,
 *     which is exactly the case during Next.js server rendering, so the only
 *     real defence is server-side sanitisation on write.
 *
 * Payloads assign `window.__XSS_FIRED`, so a pass means the script did not run
 * — not merely that a string looked escaped somewhere.
 */

const PAYLOAD_HTML =
  '<img src=x onerror="window.__XSS_FIRED=1"><script>window.__XSS_FIRED=1</script><p>legit body text</p>';

async function xssFired(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __XSS_FIRED?: number }).__XSS_FIRED === 1,
  );
}

test.describe('stored XSS — markdown path (ReactMarkdown)', () => {
  test('a challenge whose description/editorial/hints carry a script payload renders it inert', async ({
    page,
  }) => {
    await login(page, 'student');
    // A missing fixture fails here rather than skipping: a skipped XSS test
    // is a green line that proves nothing.
    const probe = await fixtureChallenge(page, FIXTURE_XSS_CHALLENGE);

    // Listing page renders challenge.description through <ReactMarkdown>.
    await page.goto('/coding-challenges');
    await settle(page);
    expect(await xssFired(page), 'payload executed on the challenge list').toBe(
      false,
    );

    // Detail page renders description, input/output format and editorial.
    await page.goto(`/coding-challenges/${probe.id}`);
    await settle(page);
    expect(
      await xssFired(page),
      'payload executed on the challenge detail page',
    ).toBe(false);

    // No live script/handler made it into the DOM…
    expect(await page.locator('script:has-text("__XSS_FIRED")').count()).toBe(
      0,
    );
    expect(await page.locator('[onerror]').count()).toBe(0);
    // …and no javascript: link survived react-markdown's urlTransform.
    expect(await page.locator('a[href^="javascript:"]').count()).toBe(0);
  });
});

test.describe('stored XSS — HTML path (dangerouslySetInnerHTML)', () => {
  test('POST /resources/save/:topicId cannot store an executable article body', async ({
    page,
  }) => {
    await login(page, 'student');
    const topicId = await fixtureTopicId(page);

    // This write path skipped the sanitiser that POST /articles applies, which
    // made it a way to store raw HTML into a field the app renders with
    // dangerouslySetInnerHTML.
    const saved = await apiAs(page, 'POST', `/resources/save/${topicId}`, {
      content: PAYLOAD_HTML,
    });
    expect(saved.status(), await saved.text()).toBeLessThan(300);
    const articleId = (await saved.json())?.data?.id;
    expect(articleId).toBeTruthy();

    const stored = (await saved.json())?.data?.content ?? '';
    expect(stored, 'stored body must not contain a script tag').not.toMatch(
      /<script/i,
    );
    expect(stored, 'stored body must not contain an event handler').not.toMatch(
      /onerror/i,
    );
    expect(stored, 'safe markup must survive').toContain('legit body text');
  });

  test('a published article renders its body without executing anything', async ({
    page,
  }) => {
    await login(page, 'student');
    const topicId = await fixtureTopicId(page);

    const created = await apiAs(page, 'POST', '/articles', {
      title: 'E2E XSS probe article',
      content: PAYLOAD_HTML,
      topic_id: topicId,
    });
    expect(created.status(), await created.text()).toBeLessThan(300);
    const articleId = (await created.json())?.data?.id;
    expect(articleId).toBeTruthy();

    const approved = await apiAs(
      page,
      'POST',
      '/articles/status',
      { articleId, status: 'APPROVED' },
      'moderator',
    );
    expect(approved.status(), await approved.text()).toBeLessThan(300);

    // The SERVER-rendered HTML is the assertion that matters: client-side
    // DOMPurify is a no-op without a DOM, so anything unsanitised on write
    // lands in this payload and runs before hydration ever happens.
    const ssr = await page.request.get(`/articles/${articleId}`);
    expect(ssr.status()).toBeLessThan(400);
    const ssrHtml = await ssr.text();
    expect(ssrHtml, 'raw event handler in server-rendered HTML').not.toMatch(
      /onerror\s*=/i,
    );
    expect(ssrHtml, 'raw script tag in server-rendered HTML').not.toMatch(
      /<script>window\.__XSS_FIRED/i,
    );

    // The article body must be present in the SERVER's HTML at all. It wasn't:
    // the client-side DOMPurify call threw during SSR ("sanitize is not a
    // function" — no DOM, so the default export is still a factory), Next fell
    // back to client-only rendering, and the page shipped with an empty body.
    expect(
      ssrHtml,
      'article body missing from server-rendered HTML (SSR fell back to client rendering)',
    ).toContain('legit body text');

    // And in a real browser, nothing executes and the safe text survives.
    await page
      .goto(`/articles/${articleId}`, { waitUntil: 'domcontentloaded' })
      .catch(async () => {
        await page.goto(`/articles/${articleId}`, {
          waitUntil: 'domcontentloaded',
        });
      });
    await settle(page);
    await expect(page.locator('body')).toContainText('legit body text');
    expect(await xssFired(page), 'article payload executed').toBe(false);
  });

  test('POST /resources/create cannot store an executable resource body', async ({
    page,
  }) => {
    await login(page, 'student');
    const created = await apiAs(page, 'POST', '/resources/create', {
      title: `E2E XSS resource ${PAYLOAD_HTML}`,
      content: PAYLOAD_HTML,
      type: 'article',
      description: 'probe',
      url: 'https://example.com',
      category: 'frontend',
      difficulty: 'EASY',
      language: 'en',
    });
    expect(created.status(), await created.text()).toBeLessThan(300);
    const data = (await created.json())?.data;
    expect(data?.content ?? '').not.toMatch(/onerror|<script/i);
    expect(data?.title ?? '').not.toMatch(/[<>]/);
  });
});
