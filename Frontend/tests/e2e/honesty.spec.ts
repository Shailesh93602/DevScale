import { test, expect } from '@playwright/test';
import { settle } from './helpers';

/**
 * ED-5 — honesty audit.
 *
 * Fabricated social proof is the one class of bug that damages the owner
 * rather than the user: a recruiter who spots invented students at invented
 * colleges stops trusting everything else on the page. These tests fail if
 * invented people, invented institutions, or third-party stock avatars come
 * back, and if placeholder content is ever presented as real published work.
 */

const INVENTED_COLLEGES =
  /IIT Bombay|IIT Kharagpur|IIT Delhi|BITS Pilani|VIT Vellore/i;
const STOCK_AVATAR_HOSTS =
  /pravatar\.cc|randomuser\.me|thispersondoesnotexist|placekitten/i;

test.describe('honesty', () => {
  test('the landing page shows no invented people, colleges, or stock avatars', async ({
    page,
  }) => {
    await page.goto('/');
    await settle(page);

    const html = await page.content();
    expect(
      html.match(STOCK_AVATAR_HOSTS)?.[0],
      'a third-party stock-avatar service is being used as social proof',
    ).toBeUndefined();
    expect(
      html.match(INVENTED_COLLEGES)?.[0],
      'invented students are attributed to real institutions',
    ).toBeUndefined();

    // Any leaderboard-like block on the landing page must be labelled as a
    // sample if it is not fed by real data.
    const leaderboard = page.locator('text=/leaderboard/i').first();
    if (await leaderboard.count()) {
      const section = page
        .locator('section, div')
        .filter({ has: leaderboard })
        .first();
      const text = (await section.innerText().catch(() => '')).toLowerCase();
      expect(
        /preview|sample|example|demo|illustrat/.test(text),
        'the landing leaderboard is not labelled as a preview/sample',
      ).toBe(true);
    }
  });

  test('/blogs does not present placeholder posts as published content', async ({
    page,
  }) => {
    await page.goto('/blogs');
    await settle(page);

    const body = await page.locator('body').innerText();

    // Every blog card must lead somewhere real.
    const links = await page.locator('a[href^="/blogs/"]').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href === '/blogs') continue;
      const res = await page.request.get(href);
      expect(res.status(), `dead blog link: ${href}`).toBeLessThan(400);
      const html = await res.text();
      expect(
        /Loading\.\.\./.test(html) && !/<article|<main/i.test(html),
        `${href} renders a permanent "Loading..." placeholder`,
      ).toBe(false);
    }

    // If there is nothing to show, say so — don't invent three posts.
    if (links.length === 0) {
      expect(body).toMatch(/no blog posts|coming soon|check back/i);
    }

    // The specific fabricated posts must not come back.
    for (const invented of [
      'Understanding JavaScript Closures',
      'A Guide to Responsive Web Design',
      'Top 10 CSS Tricks for Beginners',
    ]) {
      expect(body, `fabricated blog post is back: ${invented}`).not.toContain(
        invented,
      );
    }
  });

  test('no page advertises metrics that no backend produces', async ({
    page,
  }) => {
    // Guard against re-introducing invented counts ("10,000+ students",
    // "4.9/5 from 200 reviews") on the marketing surfaces.
    const FABRICATED_METRIC =
      /\b\d{1,3}(,\d{3})+\+?\s*(students|users|developers|learners|companies)\b|\b\d\.\d\s*\/\s*5\b/i;
    for (const path of ['/', '/pricing', '/battle-zone']) {
      await page.goto(path);
      await settle(page);
      const text = await page.locator('body').innerText();
      const hit = text.match(FABRICATED_METRIC)?.[0];
      expect(hit, `${path} states an unsourced metric: ${hit}`).toBeUndefined();
    }
  });
});
