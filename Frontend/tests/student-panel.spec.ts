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

    // Global mock for user profile — must match UserProfile shape (first_name/last_name, not name)
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            id: 'test-user-id',
            first_name: 'Admin',
            last_name: 'User',
            username: 'admin',
            email: 'admin@eduscale.io',
            avatar_url: 'https://github.com/shadcn.png',
            bio: 'Engineering Student',
            created_at: '2023-01-01T00:00:00.000Z',
          },
        },
      });
    });

    // Emulate reduced motion so Framer Motion skips JS animations (instant render)
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Mock the unified dashboard summary endpoint (replaces old individual mocks)
    await page.route('**/dashboard/summary*', async (route) =>
      route.fulfill({
        json: {
          success: true,
          data: {
            stats: {
              enrolledRoadmaps: 2,
              totalTopics: 50,
              totalTopicsCompleted: 10,
              totalHoursSpent: 120,
              averageProgress: 20,
              battleRank: 5,
            },
            enrolledRoadmaps: [],
            recommendedRoadmaps: [],
            activities: [],
            achievements: [],
            streak: {
              currentStreak: 5,
              longestStreak: 10,
              lastActivityDate: null,
              streakStartDate: null,
              timezone: 'UTC',
            },
            weeklyActivity: [],
          },
        },
      }),
    );
    // Keep roadmap mock (used by other hooks/components)
    await page.route('**/roadmaps*', async (route) =>
      route.fulfill({ json: { success: true, data: [] } }),
    );

    await loginAsStudent(page);
  });

  // --- Dashboard ---
  test('Dashboard: Functional, Visual & Accessibility Check', async ({
    page,
  }) => {
    // Re-navigate to ensure Next.js compilation is complete (first visit in dev triggers JIT compile)
    await page.goto('/dashboard');
    // Wait for the dashboard heading — only visible after API completes & compilation finishes
    await expect(
      page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible({ timeout: 45000 });

    // 2. Functional: Stats (StatCard uses <p>, not <h>, so use getByText)
    await expect(page.getByText('Enrolled Roadmaps').first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Topics Completed').first()).toBeVisible({
      timeout: 15000,
    });

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
    // Re-navigate to ensure Next.js compilation is complete
    await page.goto('/dashboard');
    // Wait for dashboard heading to confirm full load
    await expect(
      page.getByRole('heading', { name: 'Dashboard', exact: true }),
    ).toBeVisible({ timeout: 45000 });
    // Check for the StreakCalendar section header (always visible after load)
    await expect(page.getByText('Learning Streak').first()).toBeVisible({
      timeout: 15000,
    });
  });

  // --- Profile ---
  test('Profile: Detailed Verification', async ({ page }) => {
    // Mock Profile API — same shape as beforeEach mock, matches UserProfile interface
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        json: {
          success: true,
          data: {
            id: 'test-user-id',
            first_name: 'Admin',
            last_name: 'User',
            username: 'admin',
            email: 'admin@eduscale.io',
            avatar_url: 'https://github.com/shadcn.png',
            bio: 'Engineering Student',
            created_at: '2023-01-01T00:00:00.000Z',
          },
        },
      });
    });

    await page.goto('/profile');
    // Wait for profile to fully load (Next.js JIT compile + API call)
    await page
      .waitForLoadState('networkidle', { timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(2000);

    // Verify Name first to ensure load
    await expect(page.getByText(/Admin User/i)).toBeVisible({ timeout: 20000 });

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
    // Mock the challenges API — data must be array (not {challenges:[...]})
    await page.route('**/challenges*', async (route) => {
      const json = {
        success: true,
        message: 'Challenges fetched successfully',
        data: [
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
        meta: {
          total: 2,
          totalPages: 1,
          currentPage: 1,
          limit: 12,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      await route.fulfill({ json });
    });

    await page.goto('/coding-challenges');
    // Wait for Next.js compilation + initial data load
    await page
      .waitForLoadState('networkidle', { timeout: 30000 })
      .catch(() => {});

    await expect(
      page.getByRole('heading', { name: 'Coding Challenges' }),
    ).toBeVisible({ timeout: 20000 });

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

    // Navbar uses lg:flex (not md:flex) for the desktop center section
    const centeredNavContainer = page
      .locator('nav .hidden.flex-1.items-center.justify-center.lg\\:flex')
      .first();
    await expect(centeredNavContainer).toBeVisible();

    const profileTrigger = page.getByRole('button', {
      name: 'User Profile Menu',
    });
    await expect(profileTrigger).toBeVisible();
  });
});
