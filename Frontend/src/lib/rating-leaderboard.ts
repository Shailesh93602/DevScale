import {
  displayName,
  type RatingLeaderboardEntry,
} from '@/components/Landing/SimpleWeeklyLeaderboard';

export interface LeaderboardEntry {
  id: string;
  username: string;
  rank: number;
  score: number;
  battles_won: number;
  battles_participated: number;
  win_rate: number;
}

/** `/leaderboard` returns bare score rows with no user; `/ratings/leaderboard` carries the user and the record. */
export function toLeaderboardEntries(
  rows: RatingLeaderboardEntry[] | null | undefined,
): LeaderboardEntry[] {
  return (Array.isArray(rows) ? rows : []).map((row, i) => {
    const played = Number(row.gamesPlayed) || 0;
    const wins = Number(row.wins) || 0;
    return {
      id: row.userId ?? row.user?.id ?? String(i),
      username: row.user ? displayName(row) : 'Unknown player',
      rank: i + 1,
      score: Number(row.rating) || 0,
      battles_won: wins,
      battles_participated: played,
      win_rate: played ? Math.round((wins / played) * 100) : 0,
    };
  });
}
