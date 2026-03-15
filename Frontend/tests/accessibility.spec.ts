import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loginAsStudent } from './utils/login';

const publicRoutes = [
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
  { path: '/interview-question', name: 'interview-question' },
  { path: '/discussion-forums', name: 'discussion-forums' },
  { path: '/tech-interests-assessment', name: 'tech-assessment' },
  { path: '/events', name: 'events' },
  { path: '/collaboration-opportunities', name: 'collaboration' },
  { path: '/discussions', name: 'discussions' },
  { path: '/member-highlights', name: 'member-highlights' },
  { path: '/article-listing', name: 'article-listing' },
];

const protectedRoutes = [
  { path: '/battle-zone', name: 'battle-zone' },
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
  { path: '/create-resource', name: 'create-resource' },
];

test.describe('Accessibility Audits', () => {
  for (const route of publicRoutes) {
    test(`${route.name} (Public) should pass WCAG AA guidelines`, async ({
      page,
    }) => {
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForTimeout(2000); // Wait for content

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('nextjs-portal')
        .analyze();

      console.log(
        `Page: ${route.path} - Violations: ${accessibilityScanResults.violations.length}`,
      );

      if (accessibilityScanResults.violations.length > 0) {
        // Log details for debugging
        accessibilityScanResults.violations.forEach((v) => {
          console.log(`[${route.name}] Violation: ${v.id} - ${v.help}`);
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  for (const route of protectedRoutes) {
    test(`${route.name} (Protected) should pass WCAG AA guidelines`, async ({
      page,
    }) => {
      // Login first
      await loginAsStudent(page);

      // Navigate to protected route
      await page.goto(route.path, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });
      await page.waitForTimeout(3000); // Wait for content load

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('nextjs-portal')
        .analyze();

      console.log(
        `Page: ${route.path} - Violations: ${accessibilityScanResults.violations.length}`,
      );

      if (accessibilityScanResults.violations.length > 0) {
        // Log details for debugging
        accessibilityScanResults.violations.forEach((v) => {
          console.log(`[${route.name}] Violation: ${v.id} - ${v.help}`);
        });
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
