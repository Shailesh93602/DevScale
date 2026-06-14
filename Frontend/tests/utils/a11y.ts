import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function checkAccessibility(page: Page, contextName: string) {
  // Audit the SETTLED page (matches accessibility.spec). Without this, axe scans
  // during loading splashes/skeletons and flags transient low-contrast states
  // that are gone once the page has rendered.
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('nextjs-portal')
    .analyze();

  if (accessibilityScanResults.violations.length > 0) {
    console.log(
      `Accessibility violations in ${contextName}:`,
      JSON.stringify(accessibilityScanResults.violations, null, 2),
    );
  }

  expect(accessibilityScanResults.violations).toEqual([]);
}
