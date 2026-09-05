/**
 * The one place the battle statistics payload is read.
 *
 * WHY THIS FILE EXISTS. `GET /battles/statistics/me` is one query
 * (Backend `battleRepository.getUserStats`) and it returns ONE shape: the
 * counters live under `stats`, the breakdowns beside it. The statistics page
 * used to read `d.total_battles`, `d.wins`, `d.win_rate`, `d.accuracy` … from
 * the TOP level, each behind a `?? 0` fallback that also accepted a second,
 * camelCase spelling nothing ever sent. Every key missed, every fallback fired,
 * and the page rendered "Win Rate 0% — 0 of 0 battles", "Accuracy 0% — 0 of 0
 * questions", "0 total points" and "0s" for a player whose Performance-by-
 * Difficulty card, read from the correct top-level array, said "2 battles" on
 * the same screen. The Battle Zone header's quick stat did the same and showed
 * "--". A shape mismatch was indistinguishable from "no data yet".
 *
 * So: the raw type below is the backend's shape and nothing else, there are no
 * alternate spellings and no silent zeros, and every number the UI prints is
 * derived here — the Win Rate value from the same `wins` / `completedBattles`
 * its description prints, the per-group rates from the same arrays whose
 * battle counts the cards show. `normalize.test.ts` pins the derivations and
 * the agreement between them; Flow 8 in `tests/battle-zone-real.spec.ts`
 * asserts the rendered cards agree with the live API answer.
 */

export interface RawGroupStats {
  groupId: string;
  label: string;
  battles: number;
  wins: number;
  win_rate: number;
  avg_score: number;
}

export interface RawRecentBattle {
  id: string;
  title: string;
  status: string;
  /** 'won' | 'lost' | 'draw' for completed battles, else the status lower-cased. */
  result: string;
  score: number | null;
  rank: number | null;
  difficulty: string | null;
  topic: string | null;
  ended_at: string | null;
}

export interface RawWeekStats {
  week: string;
  battles: number;
  wins: number;
  avg_score: number;
}

/** Exactly what the backend sends — see `getUserStats` in battleRepository.ts. */
export interface RawBattleStatistics {
  stats: {
    /** Every participation, including cancelled and in-progress battles. */
    total_battles: number;
    /** The denominator of every rate on the page. */
    completed_battles: number;
    wins: number;
    win_rate: number;
    total_score: number;
    correct_answers: number;
    total_answers: number;
    accuracy: number;
    avg_time_ms: number;
  };
  recent_battles: RawRecentBattle[];
  performance_by_difficulty: RawGroupStats[];
  performance_by_topic: RawGroupStats[];
  performance_over_time: RawWeekStats[];
}

export type BattleOutcome = 'win' | 'loss' | 'draw' | 'cancelled' | 'ongoing';

export interface GroupPerformance {
  label: string;
  battles: number;
  wins: number;
  /** wins / battles, rounded. Null when the group has no battles. */
  winRatePercent: number | null;
  averageScore: number;
}

export interface BattleStatistics {
  totalBattles: number;
  completedBattles: number;
  battlesWon: number;
  battlesLost: number;
  /** wins / completedBattles, rounded. Null until a battle has completed. */
  winRatePercent: number | null;
  totalPoints: number;
  averageScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  /** correctAnswers / questionsAnswered, rounded. Null until one is answered. */
  accuracyPercent: number | null;
  averageTimeSeconds: number;
  recentBattles: {
    id: string;
    title: string;
    date: string;
    outcome: BattleOutcome;
    score: number;
    rank: number | null;
  }[];
  performanceByDifficulty: GroupPerformance[];
  performanceByTopic: GroupPerformance[];
  /** Best topics by average score — derived from performanceByTopic, not a separate feed. */
  topTopics: GroupPerformance[];
  performanceOverTime: {
    date: string;
    score: number;
    winRatePercent: number | null;
  }[];
}

/** Integer percentage, or null when there is nothing to divide by. */
export function ratePercent(
  numerator: number,
  denominator: number,
): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 100);
}

/** "67%" or "--" — never "NaN%" and never a confident "0%" for no data. */
export function formatPercent(value: number | null): string {
  return value === null ? '--' : `${value}%`;
}

export function toOutcome(raw: RawRecentBattle): BattleOutcome {
  switch (raw.result) {
    case 'won':
      return 'win';
    case 'lost':
      return 'loss';
    case 'draw':
      return 'draw';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'ongoing';
  }
}

function toGroup(g: RawGroupStats): GroupPerformance {
  return {
    label: g.label,
    battles: g.battles,
    wins: g.wins,
    winRatePercent: ratePercent(g.wins, g.battles),
    averageScore: g.avg_score,
  };
}

function titleCase(value: string): string {
  return value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : value;
}

export function normalizeBattleStatistics(
  raw: RawBattleStatistics,
): BattleStatistics {
  const s = raw.stats;
  const byTopic = (raw.performance_by_topic ?? []).map(toGroup);

  return {
    totalBattles: s.total_battles,
    completedBattles: s.completed_battles,
    battlesWon: s.wins,
    battlesLost: Math.max(0, s.completed_battles - s.wins),
    winRatePercent: ratePercent(s.wins, s.completed_battles),
    totalPoints: s.total_score,
    averageScore:
      s.completed_battles > 0
        ? Math.round(s.total_score / s.completed_battles)
        : 0,
    questionsAnswered: s.total_answers,
    correctAnswers: s.correct_answers,
    accuracyPercent: ratePercent(s.correct_answers, s.total_answers),
    averageTimeSeconds: Math.round((s.avg_time_ms ?? 0) / 1000),
    recentBattles: (raw.recent_battles ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      date: b.ended_at ? new Date(b.ended_at).toLocaleDateString() : '',
      outcome: toOutcome(b),
      score: b.score ?? 0,
      rank: b.rank,
    })),
    performanceByDifficulty: (raw.performance_by_difficulty ?? []).map((g) => ({
      ...toGroup(g),
      label: titleCase(g.label),
    })),
    performanceByTopic: byTopic,
    topTopics: [...byTopic]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3),
    performanceOverTime: (raw.performance_over_time ?? []).map((w) => ({
      date: w.week,
      score: w.avg_score,
      winRatePercent: ratePercent(w.wins, w.battles),
    })),
  };
}

/**
 * The Win Rate card, value and caption from the SAME two numbers, so they
 * cannot disagree: "50%" above "1 of 2 battles".
 */
export function winRateSummary(stats: BattleStatistics): {
  value: string;
  description: string;
} {
  return {
    value: formatPercent(stats.winRatePercent),
    description: `${stats.battlesWon} of ${stats.completedBattles} battles`,
  };
}
