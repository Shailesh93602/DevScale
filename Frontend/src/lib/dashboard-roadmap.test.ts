import { describe, it, expect } from 'vitest';
import type { RoadmapSummary } from '@/hooks/useDashboard';
import { mapToRoadmapType } from './dashboard-roadmap';

/**
 * The bug this covers was not a crash and not a wrong calculation — it was a
 * value invented to fill a field the API does not send. `estimatedTime` was
 * hardcoded to `'2-3 hours'` and `difficulty` to `'beginner'`, and
 * `RoadmapCard` renders each whenever it is truthy, so every card on the
 * dashboard carried a Clock badge reading "2-3 hours" and a Badge reading
 * "BEGINNER" no matter what the roadmap was.
 *
 * So these tests assert on ABSENCE, which is the only thing that distinguishes
 * "we do not know" from "we made something up". `toBeUndefined()` here is
 * load-bearing, not a placeholder.
 *
 * The mapper was moved out of `app/dashboard/page.tsx` to make this testable
 * against the real function rather than by mounting the page and squinting at
 * the DOM.
 */

/** Exactly what `shapeRoadmap` in dashboardRepository.ts returns. Nothing more. */
const summaryPayload = (): RoadmapSummary => ({
  id: 'rm-1',
  title: 'Backend Engineering',
  description: 'From HTTP to queues.',
  user: {
    id: 'u-1',
    username: 'ada',
    first_name: 'Ada',
    last_name: 'Lovelace',
    avatar_url: 'https://example.com/a.png',
  },
  _count: { likes: 7, user_roadmaps: 3, topics: 42 },
});

describe('mapToRoadmapType', () => {
  it('carries through the fields the summary endpoint really returns', () => {
    const card = mapToRoadmapType(summaryPayload(), true);
    expect(card.id).toBe('rm-1');
    expect(card.title).toBe('Backend Engineering');
    expect(card.steps).toBe(42);
    expect(card.likesCount).toBe(7);
    expect(card.isEnrolled).toBe(true);
    expect(card.author.name).toContain('Ada');
  });

  it('does NOT invent an estimated time — the payload has no duration', () => {
    expect(
      mapToRoadmapType(summaryPayload(), false).estimatedTime,
    ).toBeUndefined();
  });

  it('does NOT invent a difficulty — the payload has no difficulty', () => {
    expect(
      mapToRoadmapType(summaryPayload(), false).difficulty,
    ).toBeUndefined();
  });

  it('does NOT invent timestamps', () => {
    const card = mapToRoadmapType(summaryPayload(), false);
    expect(card.createdAt).toBeUndefined();
    expect(card.updatedAt).toBeUndefined();
  });

  it('emits no placeholder date literal anywhere in the mapped object', () => {
    // The old code wrote '2024-01-01T00:00:00.000Z' into two fields. Catch it
    // wherever it might reappear, not only in the two it used to occupy.
    const serialised = JSON.stringify(
      mapToRoadmapType(summaryPayload(), false),
    );
    expect(serialised).not.toContain('2024-01-01');
    expect(serialised).not.toContain('2-3 hours');
    expect(serialised).not.toContain('beginner');
  });

  it('degrades to an honest empty card when the payload is bare', () => {
    // No user, no counts. Everything unknown must stay unknown rather than
    // falling back to something that renders as a claim.
    const card = mapToRoadmapType({ id: 'rm-2', title: 'Untitled' }, false);
    expect(card.steps).toBe(0);
    expect(card.likesCount).toBe(0);
    expect(card.estimatedTime).toBeUndefined();
    expect(card.difficulty).toBeUndefined();
    expect(card.author.id).toBe('anonymous');
  });

  it('every value it produces is traceable to the input', () => {
    // A general statement of the rule, so a NEW invented field fails this even
    // if nobody thinks to add a named assertion for it. Every string in the
    // output must appear in the input, or be one of the known structural
    // constants.
    const input = summaryPayload();
    const allowed = new Set(['anonymous', '']);
    const strings = Object.values(
      JSON.parse(JSON.stringify(mapToRoadmapType(input, false))) as Record<
        string,
        unknown
      >,
    ).flatMap(function collect(v: unknown): string[] {
      if (typeof v === 'string') return [v];
      if (v && typeof v === 'object') return Object.values(v).flatMap(collect);
      return [];
    });
    const inputText = JSON.stringify(input);
    const invented = strings.filter(
      (s) =>
        !allowed.has(s) && !inputText.includes(s) && !/^Ada Lovelace$/.test(s),
    );
    expect(invented, 'these strings came from nowhere').toEqual([]);
  });
});
