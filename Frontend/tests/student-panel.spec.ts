import { test, expect } from '@playwright/test';
import { loginAsStudent } from './utils/login';
import { checkAccessibility } from './utils/a11y';

test.describe('Student Panel Features - Professional Grade', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }',
    });

    // Debug console logs
    page.on('console', (msg) => console.log(`BROWSER LOG: ${msg.text()}`));

    // Global mock for user profile to prevent App.tsx errors
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            success: true,
            user: {
              name: 'Admin User',
              email: 'admin@eduscale.io',
              username: 'admin',
              avatar: 'https://github.com/shadcn.png',
              bio: 'Engineering Student',
              memberSince: '2023-01-01',
              note: 'Test Note',
              socialLinks: { github: '', linkedin: '', twitter: '' },
            },
          },
        },
      });
    });

    // Mock Dashboard endpoints to prevent CORS/Network errors
    await page.route('**/dashboard/stats', async (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            enrolledRoadmaps: 2,
            totalTopics: 50,
            totalTopicsCompleted: 10,
            totalHoursSpent: 120,
            battleRank: 5,
          },
        },
      }),
    );
    // Mock both relative and absolute URLs for roadmaps
    await page.route('**/roadmaps*', async (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );
    await page.route('http://localhost:4000/api/v1/roadmaps*', async (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );

    await page.route('**/streak/*', async (route) =>
      route.fulfill({
        json: {
          success: true,
          data: { currentStreak: 5, longestStreak: 10, activity: {} },
        },
      }),
    );
    await page.route('**/activities', async (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );
    await page.route('**/achievements', async (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );

    await loginAsStudent(page);
  });

  // --- Dashboard ---
  test('Dashboard: Functional, Visual & Accessibility Check', async ({
    page,
  }) => {
    // 2. Functional: Stats
    await expect(
      page.getByRole('heading', { name: 'Enrolled Roadmaps', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Topics Completed', exact: true }),
    ).toBeVisible();

    // Wait for animations to complete (Framer Motion)
    await page.waitForTimeout(2000);

    // 1. Accessibility Scan (After content load)
    await checkAccessibility(page, 'Dashboard');

    // 3. Visual: Dark Mode Toggle
    // Toggle to Dark Mode
    const themeToggle = page.getByRole('button', { name: /Switch to/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click({ force: true });
      await page.waitForTimeout(1000); // Allow transition
      // Verify dark mode class on html or body
      const html = page.locator('html');
      // Check for class containing 'dark'
      await expect(html).toHaveClass(/dark/);

      // Take screenshot of dark mode
      // await expect(page).toHaveScreenshot('dashboard-dark.png'); // Uncomment when baseline is established

      // Toggle back to Light Mode
      await themeToggle.click();
      await page.waitForTimeout(500);
      // Check for class NOT containing 'dark' or containing 'light'
      await expect(html).not.toHaveClass(/dark/);
    }
  });

  test('Dashboard: Weekly Activity Chart exists', async ({ page }) => {
    // Check for specific days on the X-axis OR "No Activity Yet"
    const chartOrEmpty = page
      .locator('text=No Activity Yet')
      .or(page.locator('text=Mon'));
    await expect(chartOrEmpty.first()).toBeVisible();
  });

  // --- Profile ---
  test('Profile: Detailed Verification', async ({ page }) => {
    // Mock Profile API
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            success: true,
            user: {
              name: 'Admin User',
              email: 'admin@eduscale.io',
              username: 'admin',
              avatar: 'https://github.com/shadcn.png',
              bio: 'Engineering Student',
              memberSince: '2023-01-01',
              note: 'Test Note',
              socialLinks: { github: '', linkedin: '', twitter: '' },
            },
          },
        },
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Verify Name first to ensure load
    await expect(page.getByText(/Admin User/i)).toBeVisible();

    await checkAccessibility(page, 'Profile');

    // Verify Email
    await expect(page.getByText(/admin@eduscale.io/i)).toBeVisible();

    // Verify Tabs
    // Note: Tabs might be loaded dynamically or have specific ARIA roles
    // await expect(page.getByRole('tablist')).toBeVisible();
  });

  // --- Learning Path ---
  test('Career Roadmap: Discovery & Navigation', async ({ page }) => {
    await page.goto('/career-roadmap');

    await expect(
      page.getByRole('heading', { name: /Master Your/i }),
    ).toBeVisible();

    await checkAccessibility(page, 'Career Roadmap');

    // Check if "Explore Popular Paths" button exists
    const exploreBtn = page.getByRole('button', {
      name: 'Explore Popular Paths',
    });
    await expect(exploreBtn).toBeVisible();
    await exploreBtn.click();

    // Wait for navigation
    await page.waitForURL('**/career-roadmap/roadmaps');

    // Should navigate to roadmaps list or scroll
    await expect(page.url()).toContain('/career-roadmap/roadmaps');
  });

  // --- Battle Zone ---
  test('Battle Zone: Challenges & Accessibility', async ({ page }) => {
    // Mock the challenges API
    await page.route('**/challenges*', async (route) => {
      const json = {
        success: true,
        message: 'Challenges fetched successfully',
        data: {
          challenges: [
            {
              id: '1',
              title: 'Two Sum',
              description: 'Find two numbers that add up to a target.',
              difficulty: 'Easy',
            },
            {
              id: '2',
              title: 'Reverse Linked List',
              description: 'Reverse a singly linked list.',
              difficulty: 'Medium',
            },
          ],
          totalPages: 1,
        },
      };
      await route.fulfill({ json });
    });

    await page.goto('/coding-challenges');

    await expect(
      page.getByRole('heading', { name: 'Coding Challenges' }),
    ).toBeVisible();

    await checkAccessibility(page, 'Coding Challenges');

    // Check search input
    const searchInput = page.getByPlaceholder('Search challenges by title...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Two Sum');

    // Wait for debounce
    await page.waitForTimeout(600);

    // Check list updates
    const listContainer = page.locator('ul.grid');
    await expect(listContainer).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Two Sum' }).first(),
    ).toBeVisible();
  });

  // --- Community ---
  test('Community: Doubts Corner Form Validation', async ({ page }) => {
    await page.goto('/doubts');

    await expect(
      page.getByRole('heading', { name: 'Doubts Corner' }),
    ).toBeVisible();

    await checkAccessibility(page, 'Doubts Corner');

    // Try empty submit
    const submitBtn = page.getByRole('button', { name: 'Submit' });
    await submitBtn.click();

    // Expect validation message (HTML5 validation or custom)
    // If it's HTML5 required, Playwright might not catch a visible error text easily,
    // but we can check if the textarea is invalid.
    const textarea = page.locator('textarea#question');
    // Check if it's focused or has validation state
    // For now, let's just ensure it didn't navigate or show success toast
    await expect(
      page.getByText('Your question has been submitted!'),
    ).not.toBeVisible();

    // Fill valid data
    await textarea.fill('How do I test accessibility with Playwright?');
    await submitBtn.click();

    // Expect success toast
    await expect(
      page.getByText('Your question has been submitted!'),
    ).toBeVisible();
  });

  test('Dashboard: Navbar keeps links centered with profile at right', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/dashboard');

    const centeredNavContainer = page
      .locator('nav .hidden.flex-1.items-center.justify-center.md\\:flex')
      .first();
    await expect(centeredNavContainer).toBeVisible();

    const profileTrigger = page.getByRole('button', {
      name: 'User Profile Menu',
    });
    await expect(profileTrigger).toBeVisible();
  });
});
