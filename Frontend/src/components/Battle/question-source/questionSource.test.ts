import { describe, expect, it } from 'vitest';
import {
  SourceSelection,
  formatDsaLabel,
  resolveActiveSource,
  unwrapList,
} from './questionSource';

const base: SourceSelection = {
  mode: 'curriculum',
  roadmaps: [{ id: 'r1', title: 'Full Stack' }],
  mainConcepts: [{ id: 'mc1', name: 'Frontend' }],
  subjects: [{ id: 's1', title: 'React' }],
  topics: [{ id: 't1', title: 'Hooks' }],
  selectedRoadmap: '',
  selectedMainConcept: '',
  selectedSubject: '',
  selectedTopic: '',
  selectedCategories: [],
};

describe('resolveActiveSource', () => {
  it('returns null until something is selected', () => {
    expect(resolveActiveSource(base)).toBeNull();
    expect(resolveActiveSource({ ...base, mode: 'dsa' })).toBeNull();
  });

  it('picks the most specific curriculum level that is selected', () => {
    const all = {
      ...base,
      selectedRoadmap: 'r1',
      selectedMainConcept: 'mc1',
      selectedSubject: 's1',
      selectedTopic: 't1',
    };
    expect(resolveActiveSource(all)).toEqual({
      type: 'topic',
      id: 't1',
      label: 'Hooks',
    });
    expect(resolveActiveSource({ ...all, selectedTopic: '' })).toEqual({
      type: 'subject',
      id: 's1',
      label: 'React',
    });
    expect(
      resolveActiveSource({ ...all, selectedTopic: '', selectedSubject: '' }),
    ).toEqual({ type: 'main_concept', id: 'mc1', label: 'Frontend' });
    expect(resolveActiveSource({ ...base, selectedRoadmap: 'r1' })).toEqual({
      type: 'roadmap',
      id: 'r1',
      label: 'Full Stack',
    });
  });

  it('falls back to the id when the option list has not loaded the label', () => {
    expect(
      resolveActiveSource({ ...base, topics: [], selectedTopic: 't9' })?.label,
    ).toBe('t9');
  });

  it('ignores curriculum selections in DSA mode and joins the categories', () => {
    const src = resolveActiveSource({
      ...base,
      mode: 'dsa',
      selectedRoadmap: 'r1',
      selectedCategories: ['dynamic_programming', 'graphs'],
    });
    expect(src).toEqual({
      type: 'dsa',
      id: 'dynamic_programming,graphs',
      label: 'DSA: dynamic programming, graphs',
    });
  });
});

describe('formatDsaLabel', () => {
  it('names two categories and counts the rest', () => {
    expect(formatDsaLabel(['a_b', 'c', 'd', 'e'])).toBe('DSA: a b, c +2');
  });
});

describe('unwrapList', () => {
  it('accepts a bare array, an envelope, or nothing', () => {
    expect(unwrapList([1, 2])).toEqual([1, 2]);
    expect(unwrapList({ data: [3] })).toEqual([3]);
    expect(unwrapList(null)).toEqual([]);
    expect(unwrapList({})).toEqual([]);
  });
});
