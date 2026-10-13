import { Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/battle';
import { rankChipClass } from './battleDisplay';
import { UserAvatar } from './shared';

export function LeaderboardTab({
  leaderboard,
  userId,
}: {
  leaderboard: LeaderboardEntry[];
  userId: string | undefined;
}) {
  if (leaderboard.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col items-center py-12 text-center">
          <Trophy className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No scores yet</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {leaderboard.map((entry, i) => (
        <div
          key={entry.user_id}
          className={`flex items-center gap-3 rounded-lg border p-4 ${entry.user_id === userId ? 'border-primary/40 bg-primary/5' : ''} ${i === 0 && entry.score > 0 ? 'border-yellow-500/30' : ''}`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rankChipClass(i, entry.score > 0)}`}
          >
            {i + 1}
          </span>
          <UserAvatar username={entry.username} avatarUrl={entry.avatar_url} />
          <div className="flex-1">
            <p className="font-medium">
              {entry.username}
              {entry.user_id === userId && (
                <span className="ml-2 text-xs text-primary">(You)</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.correct_count} correct
            </p>
          </div>
          <span className="font-bold">{entry.score} pts</span>
        </div>
      ))}
    </div>
  );
}
