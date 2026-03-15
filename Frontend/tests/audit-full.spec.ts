import { test, expect } from '@playwright/test';

const allRoutes = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/auth/login', name: 'login' },
  { path: '/auth/register', name: 'register' },
  { path: '/auth/forgot-password', name: 'forgot-password' },
  { path: '/auth/verify-email', name: 'verify-email' },
  { path: '/career-roadmap', name: 'career-roadmap' },
  { path: '/community', name: 'community' },
  { path: '/coding-challenges', name: 'coding-challenges' },
  { path: '/placement-preparation', name: 'placement-prep' },
  { path: '/resources', name: 'resources' },
  { path: '/blogs', name: 'blogs' },
  { path: '/faq', name: 'faq' },
  { path: '/contact', name: 'contact' },
  { path: '/battle-zone', name: 'battle-zone' },
  { path: '/interview-question', name: 'interview-question' },
  { path: '/discussion-forums', name: 'discussion-forums' },
  { path: '/tech-interests-assessment', name: 'tech-assessment' },
  { path: '/events', name: 'events' },
  { path: '/collaboration-opportunities', name: 'collaboration' },
  { path: '/discussions', name: 'discussions' },
  { path: '/member-highlights', name: 'member-highlights' },
  { path: '/doubts', name: 'doubts' },
  { path: '/achievements', name: 'achievements' },
  { path: '/streak', name: 'streak' },
  { path: '/dashboard', name: 'dashboard' },
  { path: '/profile', name: 'profile' },
  { path: '/admin', name: 'admin' },
  { path: '/mastermind-forge', name: 'mastermind-forge' },
  { path: '/tech-pioneer', name: 'tech-pioneer' },
  { path: '/instant-battle', name: 'instant-battle' },
  { path: '/create-battle', name: 'create-battle' },
  { path: '/article-listing', name: 'article-listing' },
  { path: '/create-resource', name: 'create-resource' },
];

for (const route of allRoutes) {
  test.describe(`${route.name} (${route.path})`, () => {
    // Light mode screenshot
    test(`light mode screenshot`, async ({ page }) => {
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);
      // Force light mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('style', 'color-scheme: light');
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `test-results/audit/${route.name}-light.png`,
        fullPage: true,
      });
    });

    // Dark mode screenshot
    test(`dark mode screenshot`, async ({ page }) => {
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);
      // Force dark mode
      await page.evaluate(() => {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('style', 'color-scheme: dark');
      });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `test-results/audit/${route.name}-dark.png`,
        fullPage: true,
      });
    });

    // Mobile screenshot
    test(`mobile screenshot`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: `test-results/audit/${route.name}-mobile.png`,
        fullPage: true,
      });
    });
  });
}
