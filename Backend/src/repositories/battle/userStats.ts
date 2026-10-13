import prisma from '../../lib/prisma.js';
import type { UserParticipation } from './battleShapes.js';

// ── User statistics ───────────────────────────────────────────────────────

export async function getUserStats(userId: string, timeframe?: string) {
  const since = getTimeframeSince(timeframe);
  const participations = await prisma.battleParticipant.findMany({
    where: {
      user_id: userId,
      ...(since ? { joined_at: { gte: since } } : {}),
    },
    include: {
      battle: {
        select: {
          id: true,
          title: true,
          status: true,
          winner_id: true,
          difficulty: true,
          topic: { select: { id: true, title: true } },
          ended_at: true,
          created_at: true,
        },
      },
    },
    orderBy: { joined_at: 'desc' },
  });

  const completed = participations.filter(
    (p) => p.battle.status === 'COMPLETED'
  );
  const metrics = calculateParticipationMetrics(userId, completed);

  const wins = completed.filter((p) => p.battle.winner_id === userId).length;
  return {
    stats: {
      total_battles: participations.length,
      completed_battles: completed.length,
      wins,
      win_rate:
        completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0,
      total_score: metrics.totalScore,
      correct_answers: metrics.correctAnswers,
      total_answers: metrics.totalAnswers,
      accuracy:
        metrics.totalAnswers > 0
          ? Math.round((metrics.correctAnswers / metrics.totalAnswers) * 100)
          : 0,
      accuracy_rate:
        metrics.totalAnswers > 0
          ? Math.round((metrics.correctAnswers / metrics.totalAnswers) * 100)
          : 0,
      avg_time_ms: metrics.avgTimePerAnswer,
    },
    recent_battles: getRecentBattleSummaries(
      userId,
      participations.slice(0, 10)
    ),
    performance_by_difficulty: aggregateStatsByGroup(
      completed,
      (p) => p.battle.difficulty,
      userId
    ),
    performance_by_topic: aggregateStatsByGroup(
      completed,
      (p) => p.battle.topic?.id ?? 'unknown',
      userId,
      (p) => p.battle.topic?.title ?? 'Unknown'
    )
      .sort((a, b) => b.battles - a.battles)
      .slice(0, 5),
    performance_over_time: getPerformanceByWeek(userId, completed),
  };
}

// ── Helper methods to reduce cognitive complexity ───────────────────────

function getTimeframeSince(timeframe?: string): Date | undefined {
  const now = new Date();
  if (timeframe === 'this-week')
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  if (timeframe === 'this-month')
    return new Date(now.getFullYear(), now.getMonth(), 1);
  if (timeframe === 'this-year') return new Date(now.getFullYear(), 0, 1);
  return undefined;
}

function calculateParticipationMetrics(
  userId: string,
  completed: UserParticipation[]
) {
  const totalScore = completed.reduce((sum, p) => sum + (p.score || 0), 0);
  const correctAnswers = completed.reduce(
    (sum, p) => sum + (p.correct_count || 0),
    0
  );
  const totalAnswers = completed.reduce(
    (sum, p) => sum + (p.correct_count || 0) + (p.wrong_count || 0),
    0
  );

  const totalTimeTakenMs = completed.reduce((sum, p) => {
    const qCount = (p.correct_count || 0) + (p.wrong_count || 0);
    return sum + (p.avg_time_per_answer_ms || 0) * qCount;
  }, 0);

  return {
    totalScore,
    correctAnswers,
    totalAnswers,
    avgTimePerAnswer:
      totalAnswers > 0 ? Math.round(totalTimeTakenMs / totalAnswers) : 0,
  };
}

function getRecentBattleSummaries(
  userId: string,
  participations: UserParticipation[]
) {
  return participations.map((p) => {
    let resultLabel: string;
    if (p.battle.status === 'COMPLETED') {
      if (p.battle.winner_id === userId) resultLabel = 'won';
      else if (p.battle.winner_id === null) resultLabel = 'draw';
      else resultLabel = 'lost';
    } else {
      resultLabel = p.battle.status.toLowerCase();
    }

    return {
      id: p.battle.id,
      title: p.battle.title,
      status: p.battle.status,
      result: resultLabel,
      score: p.score,
      rank: p.rank,
      difficulty: p.battle.difficulty,
      topic: p.battle.topic?.title ?? null,
      ended_at: p.battle.ended_at,
    };
  });
}

function aggregateStatsByGroup(
  completed: UserParticipation[],
  keySelector: (p: UserParticipation) => string,
  userId: string,
  nameSelector?: (p: UserParticipation) => string
) {
  const map = new Map<
    string,
    { name: string; wins: number; total: number; score: number }
  >();
  for (const p of completed) {
    const key = keySelector(p);
    const entry = map.get(key) ?? {
      name: nameSelector ? nameSelector(p) : key,
      wins: 0,
      total: 0,
      score: 0,
    };
    entry.total += 1;
    if (p.battle.winner_id === userId) entry.wins += 1;
    entry.score += p.score || 0;
    map.set(key, entry);
  }
  return Array.from(map.entries()).map(([groupId, v]) => ({
    groupId,
    label: v.name,
    battles: v.total,
    wins: v.wins,
    win_rate: v.total > 0 ? Math.round((v.wins / v.total) * 100) : 0,
    avg_score: v.total > 0 ? Math.round(v.score / v.total) : 0,
  }));
}

function getPerformanceByWeek(userId: string, completed: UserParticipation[]) {
  const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000);
  const recent = completed.filter(
    (p) => p.battle.ended_at && p.battle.ended_at >= eightWeeksAgo
  );

  const weekMap = new Map<
    string,
    { wins: number; total: number; score: number }
  >();
  for (const p of recent) {
    const d = p.battle.ended_at;
    if (!d) continue;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];

    const entry = weekMap.get(key) ?? { wins: 0, total: 0, score: 0 };
    entry.total += 1;
    if (p.battle.winner_id === userId) entry.wins += 1;
    entry.score += p.score;
    weekMap.set(key, entry);
  }
  const performanceOverTime = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, v]) => ({
      week,
      battles: v.total,
      wins: v.wins,
      avg_score: v.total > 0 ? Math.round(v.score / v.total) : 0,
    }));

  return performanceOverTime;
}
