import { describe, it, expect } from '@jest/globals';
import { calculatePoints } from '../../repositories/battle/scoring';

// Pure scoring rules — no database, so they run everywhere (battle.test.ts is DB-only).
describe('calculatePoints', () => {
  it('returns 0 for wrong answer regardless of speed', () => {
    expect(calculatePoints(false, 100, 1000, 30)).toBe(0);
  });

  it('gives 150 points for correct answer in first 25% of time', () => {
    // time_limit=30s, taken=7s (23%) → ×1.5
    expect(calculatePoints(true, 100, 7000, 30)).toBe(150);
  });

  it('gives 125 points for correct answer in first 50% of time', () => {
    // taken=12s (40%) → ×1.25
    expect(calculatePoints(true, 100, 12000, 30)).toBe(125);
  });

  it('gives 100 points for correct answer in 50–75% window', () => {
    // taken=20s (67%) → ×1.0
    expect(calculatePoints(true, 100, 20000, 30)).toBe(100);
  });

  it('gives 75 points for correct answer in last 25% of time', () => {
    // taken=28s (93%) → ×0.75
    expect(calculatePoints(true, 100, 28000, 30)).toBe(75);
  });
});
