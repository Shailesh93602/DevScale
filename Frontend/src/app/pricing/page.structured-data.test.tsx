import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PricingPage from './page';

// Every JSON-LD value is checked against the rendered DOM, not a second copy of the plans.
function renderAndReadLd() {
  const { container } = render(<PricingPage />);
  const scripts = container.querySelectorAll(
    'script[type="application/ld+json"]',
  );
  expect(scripts).toHaveLength(1);
  return {
    container,
    ld: JSON.parse(scripts[0].textContent ?? '') as Record<string, unknown>,
  };
}

describe('/pricing structured data', () => {
  it('is a WebApplication with a free USD offer matching the rendered price', () => {
    const { container, ld } = renderAndReadLd();
    expect(ld['@type']).toBe('WebApplication');
    expect(ld.name).toBe('EduScale');
    const offers = ld.offers as Record<string, string>;
    expect(offers.priceCurrency).toBe('USD');
    const prices = [...container.querySelectorAll('span.text-5xl')].map(
      (el) => el.textContent,
    );
    expect(prices).toContain(`$${offers.price}`);
    expect(ld.isAccessibleForFree).toBe(Number(offers.price) === 0);
  });

  it('lists only features the page renders with a check, never the absent ones', () => {
    const { container, ld } = renderAndReadLd();
    const features = ld.featureList as string[];
    expect(features.length).toBeGreaterThan(0);
    const checked = [...container.querySelectorAll('li')]
      .filter((li) => !li.querySelector('.line-through'))
      .map((li) => li.textContent?.trim() ?? '');
    for (const f of features) expect(checked).toContain(f);
  });

  it('invents no rating or review', () => {
    const { ld } = renderAndReadLd();
    expect(JSON.stringify(ld)).not.toMatch(
      /aggregateRating|"review"|ratingValue/,
    );
  });
});
