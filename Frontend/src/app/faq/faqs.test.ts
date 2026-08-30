import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { FAQS, buildFaqJsonLd } from './faqs';

const BASE = 'https://eduscale.vercel.app';

/**
 * FAQPage markup must describe content the visitor can actually see.
 *
 * The sibling project shows the failure this guards against: KhataGO's /faq
 * carried ten hand-written schema questions while the page rendered eleven
 * different ones from its locale files — nine of the ten described content no
 * visitor could see. Google treats that as hidden/mismatched structured data:
 * the rich result is ineligible and it is actionable under the spam policy.
 */
describe('FAQ structured data', () => {
  it('emits exactly the questions the page renders', () => {
    const jsonLd = buildFaqJsonLd(BASE);
    expect(jsonLd.mainEntity.map((q) => q.name)).toEqual(
      FAQS.map((f) => f.question),
    );
  });

  it('has content to describe', () => {
    // Every assertion here passes vacuously against an empty list.
    expect(FAQS.length).toBeGreaterThan(3);
  });

  it('gives every question a non-empty answer', () => {
    for (const q of buildFaqJsonLd(BASE).mainEntity) {
      expect(q.name.trim().length).toBeGreaterThan(0);
      expect(q.acceptedAnswer.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('produces a valid, serializable FAQPage', () => {
    const jsonLd = buildFaqJsonLd(BASE);
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd['@context']).toBe('https://schema.org');
    for (const q of jsonLd.mainEntity) {
      expect(q['@type']).toBe('Question');
      expect(q.acceptedAnswer['@type']).toBe('Answer');
    }
    // The page injects this via JSON.stringify into a <script> tag.
    expect(() => JSON.parse(JSON.stringify(jsonLd))).not.toThrow();
  });

  it('has unique ids and questions', () => {
    expect(new Set(FAQS.map((f) => f.id)).size).toBe(FAQS.length);
    expect(new Set(FAQS.map((f) => f.question)).size).toBe(FAQS.length);
  });

  /**
   * The FAQ and the pricing page must not contradict each other.
   *
   * The cost answer used to read "completely free" while /pricing sells Pro
   * Learner at $29/mo and EduScale Team at $99/mo. Two pages on one site making
   * opposite claims means at most one is true, and a reader — or an AI answer
   * engine summarising the site — will surface whichever it finds first.
   */
  it('does not claim the product is free while /pricing sells plans', () => {
    const pricing = readFileSync('src/app/pricing/page.tsx', 'utf8');
    const paidPlans = /price:\s*'\$(?!0')/.test(pricing);
    if (!paidPlans) return; // if paid plans are ever removed, this is moot

    const costAnswer = FAQS.find((f) =>
      /cost|price|free/i.test(f.question),
    )?.answer;
    expect(costAnswer).toBeDefined();
    // "completely free" / "totally free" with no mention of paid plans is the
    // contradiction. Acknowledging both is fine.
    const claimsAllFree = /(completely|entirely|totally)\s+free/i.test(
      costAnswer!,
    );
    const mentionsPaid = /paid|plan|pricing|subscription|pro\b/i.test(
      costAnswer!,
    );
    expect(claimsAllFree && !mentionsPaid).toBe(false);
  });
});
