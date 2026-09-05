import { describe, expect, it } from 'vitest';
import {
  formatPercent,
  normalizeBattleStatistics,
  ratePercent,
  winRateSummary,
  type RawBattleStatistics,
} from './normalize';

/**
 * Captured verbatim from GET /battles/statistics/me on 2026-09-05 against the
 * local pg17 database for testuser@yopmail.com — the payload the page turned
 * into "0 of 0 battles" beside a "2 battles" card. The counters are under
 * `stats`; nothing is at the top level.
 */
const captured: RawBattleStatistics = {
  stats: {
    total_battles: 3,
    completed_battles: 2,
    wins: 0,
    win_rate: 0,
    total_score: 150,
    correct_answers: 1,
    total_answers: 9,
    accuracy: 11,
    avg_time_ms: 974,
  },
  recent_battles: [
    {
      id: '5f0ded02',
      title: '[GAMEPLAY] Flow 11',
      status: 'COMPLETED',
      result: 'lost',
      score: 150,
      rank: 2,
      difficulty: 'MEDIUM',
      topic: null,
      ended_at: '2026-09-05T06:46:32.406Z',
    },
    {
      id: '6716a478',
      title: 'Cancel Test',
      status: 'CANCELLED',
      result: 'cancelled',
      score: 0,
      rank: null,
      difficulty: 'MEDIUM',
      topic: null,
      ended_at: null,
    },
    {
      id: '74dee76e',
      title: 'Gameplay Test',
      status: 'COMPLETED',
      result: 'lost',
      score: 0,
      rank: 2,
      difficulty: 'MEDIUM',
      topic: null,
      ended_at: '2026-09-05T06:44:55.290Z',
    },
  ],
  performance_by_difficulty: [
    {
      groupId: 'MEDIUM',
      label: 'MEDIUM',
      battles: 2,
      wins: 0,
      win_rate: 0,
      avg_score: 75,
    },
  ],
  performance_by_topic: [
    {
      groupId: 'unknown',
      label: 'Unknown',
      battles: 2,
      wins: 0,
      win_rate: 0,
      avg_score: 75,
    },
  ],
  performance_over_time: [
    { week: '2026-08-30', battles: 2, wins: 0, avg_score: 75 },
  ],
};

const withStats = (
  stats: Partial<RawBattleStatistics['stats']>,
): RawBattleStatistics => ({
  ...captured,
  stats: { ...captured.stats, ...stats },
});

describe('normalizeBattleStatistics', () => {
  it('reads the counters from `stats`, not the top level (the "0 of 0 battles" bug)', () => {
    const s = normalizeBattleStatistics(captured);
    expect(s.totalBattles).toBe(3);
    expect(s.completedBattles).toBe(2);
    expect(s.battlesWon).toBe(0);
    expect(s.battlesLost).toBe(2);
    expect(s.totalPoints).toBe(150);
    expect(s.averageScore).toBe(75);
    expect(s.questionsAnswered).toBe(9);
    expect(s.correctAnswers).toBe(1);
    expect(s.accuracyPercent).toBe(11);
    expect(s.averageTimeSeconds).toBe(1);
  });

  it('the Win Rate card and the per-difficulty battle counts describe the same completed battles', () => {
    const s = normalizeBattleStatistics(captured);
    const { value, description } = winRateSummary(s);
    expect(description).toBe('0 of 2 battles');
    expect(value).toBe('0%');
    const byDifficulty = s.performanceByDifficulty.reduce(
      (n, g) => n + g.battles,
      0,
    );
    expect(byDifficulty).toBe(s.completedBattles);
  });

  it('derives the win rate from the numbers the caption prints, and it matches the backend', () => {
    const twoOfThree = withStats({
      completed_battles: 3,
      wins: 2,
      win_rate: 67,
    });
    const s = normalizeBattleStatistics(twoOfThree);
    expect(winRateSummary(s)).toEqual({
      value: '67%',
      description: '2 of 3 battles',
    });
    expect(s.winRatePercent).toBe(twoOfThree.stats.win_rate);
  });

  it('a player with no completed battle gets "--", not a confident 0%', () => {
    const s = normalizeBattleStatistics(
      withStats({
        total_battles: 1,
        completed_battles: 0,
        wins: 0,
        total_score: 0,
        total_answers: 0,
        correct_answers: 0,
      }),
    );
    expect(winRateSummary(s)).toEqual({
      value: '--',
      description: '0 of 0 battles',
    });
    expect(s.accuracyPercent).toBeNull();
    expect(s.averageScore).toBe(0);
  });

  it('maps outcomes from the backend result, including cancelled (was rendered "Ongoing")', () => {
    const s = normalizeBattleStatistics(captured);
    expect(s.recentBattles.map((b) => b.outcome)).toEqual([
      'loss',
      'cancelled',
      'loss',
    ]);
    expect(s.recentBattles[1].rank).toBeNull();
  });

  it('group breakdowns use the backend label and a per-group rate; top topics come from the same array', () => {
    const s = normalizeBattleStatistics(captured);
    expect(s.performanceByDifficulty).toEqual([
      {
        label: 'Medium',
        battles: 2,
        wins: 0,
        winRatePercent: 0,
        averageScore: 75,
      },
    ]);
    expect(s.performanceByTopic[0].label).toBe('Unknown');
    expect(s.topTopics).toEqual(s.performanceByTopic);
    expect(s.performanceOverTime).toEqual([
      { date: '2026-08-30', score: 75, winRatePercent: 0 },
    ]);
  });
});

describe('ratePercent / formatPercent', () => {
  it('never divides by zero and never prints NaN', () => {
    expect(ratePercent(0, 0)).toBeNull();
    expect(ratePercent(1, 3)).toBe(33);
    expect(ratePercent(Number.NaN, 2)).toBeNull();
    expect(formatPercent(null)).toBe('--');
    expect(formatPercent(50)).toBe('50%');
  });
});
