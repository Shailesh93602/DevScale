import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { findViolations } from './silent-skip-detector';

/** Guard against Playwright specs that pass while doing nothing; the rule is documented in ./silent-skip-detector.ts. */

const SPEC_ROOT = path.resolve(__dirname, '..', '..', 'tests');

function listSpecs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      out.push(...listSpecs(full));
    } else if (/\.(spec|steps)\.ts$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out.sort();
}

const specs = listSpecs(SPEC_ROOT).map((f) => path.relative(SPEC_ROOT, f));

describe('Playwright specs never skip their steps silently', () => {
  it('scans the real spec directory', () => {
    expect(specs.length).toBeGreaterThan(10);
  });

  it.each(specs)('%s', (rel) => {
    const text = fs.readFileSync(path.join(SPEC_ROOT, rel), 'utf-8');
    const violations = findViolations(rel, text);
    expect(
      violations.map((v) => `${v.file}:${v.line} [${v.kind}] ${v.detail}`),
    ).toEqual([]);
  });
});

// The detector has to be proven against known-bad input, or a detector that
// matches nothing would make every spec "pass" the rule above.
describe('the detector itself', () => {
  const wrap = (body: string) =>
    `import { test, expect } from '@playwright/test';\n` +
    `test('t', async ({ page }) => {\n${body}\n});\n`;

  it('flags the original journeys guard (count() around the run step)', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const runButton = page.getByRole('button', { name: /^run$/i });
  if (await runButton.count()) {
    await runButton.click();
    await expect(page.locator('text=Accepted')).toBeVisible();
  }`),
    );
    expect(v.map((x) => x.kind)).toEqual(['V1']);
  });

  it('flags a state identifier used later as the condition', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const hasDetails = await page.getByRole('button').isVisible().catch(() => false);
  if (!hasDetails) { test.skip(); return; }
  await page.getByRole('button').click();`),
    );
    expect(v.map((x) => x.kind).sort()).toEqual(['V1', 'V2', 'V3']);
  });

  it('flags a ternary that picks a fallback locator by count()', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const card = page.locator('li');
  const target = (await card.count()) > 0 ? card.first() : page.locator('a').first();
  await target.click();`),
    );
    // The branches are locators, not steps — but choosing a fallback is
    // exactly how a missing fixture goes unnoticed, so a ternary on element
    // state is reported regardless of what its branches hold.
    expect(v.map((x) => x.kind)).toEqual(['V1']);
  });

  it('flags a guard whose branch logs where an assertion belongs', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const titleError = page.getByText(/Title must be/);
  if ((await titleError.isVisible()) === false) {
    console.error('USABILITY ISSUE: Title validation error missing');
  }`),
    );
    expect(v.map((x) => x.kind)).toEqual(['V1']);
  });

  it('does not flag try/finally cleanup around real steps', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const ctx = await browser.newContext();
  try {
    await page.getByRole('button').click();
    await expect(page).toHaveURL(/done/);
  } finally {
    await ctx.close();
  }`),
    );
    expect(v).toEqual([]);
  });

  it('flags a swallowed expect and a try/catch around a step', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`await expect(page.getByText('Sampling')).not.toBeVisible().catch(() => {});
  try { await page.getByRole('button').click(); } catch { /* ignore */ }`),
    );
    expect(v.map((x) => x.kind)).toEqual(['V3', 'V3']);
  });

  it('flags every runtime skip form', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`test.skip(!process.env.X, 'no fixture');
  test.fixme();
  test.info().skip();`),
    );
    expect(v.map((x) => x.kind)).toEqual(['V2', 'V2', 'V2']);
  });

  it('allows branching on the state of a control already asserted visible', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`const toggle = page.getByRole('switch');
  await expect(toggle).toBeVisible();
  if (await toggle.isChecked()) {
    await toggle.click();
  }
  await expect(toggle).not.toBeChecked();`),
    );
    expect(v).toEqual([]);
  });

  it('allows the settle idiom and reads that are not steps', () => {
    const v = findViolations(
      'x.spec.ts',
      wrap(`await page.waitForLoadState('networkidle').catch(() => {});
  const n = await page.locator('li').count();
  expect(n).toBeGreaterThan(0);
  const json = await res.json().catch(() => null);`),
    );
    expect(v).toEqual([]);
  });
});
