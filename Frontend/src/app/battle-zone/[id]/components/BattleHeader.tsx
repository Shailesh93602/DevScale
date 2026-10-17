import { Award, Calendar, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Battle } from '@/types/battle';
import {
  DIFFICULTY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
  formatBattleDate,
} from './battleDisplay';
import { UserAvatar } from './shared';

export function BattleHeader({
  battle,
  isConnected,
}: {
  battle: Battle;
  isConnected: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={STATUS_COLORS[battle.status] ?? ''}>
          {STATUS_LABELS[battle.status] ?? battle.status}
        </Badge>
        <Badge variant="outline">
          {TYPE_LABELS[battle.type] ?? battle.type}
        </Badge>
        <Badge variant="outline">
          {DIFFICULTY_LABELS[battle.difficulty] ?? battle.difficulty}
        </Badge>
        <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <div
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'}`}
          />
          {isConnected ? 'Live' : 'Connecting…'}
        </div>
      </div>

      <h1 className="text-2xl font-bold md:text-3xl">{battle.title}</h1>
      {battle.description && (
        <p className="text-muted-foreground">{battle.description}</p>
      )}

      <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <UserAvatar
            username={battle.creator.username}
            avatarUrl={battle.creator.avatar_url}
            className="h-5 w-5"
          />
          {battle.creator.username}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {battle.current_participants} / {battle.max_participants}
        </span>
        <span className="flex items-center gap-1.5">
          <Award className="h-4 w-4" />
          {battle.topic?.title}
        </span>
        {battle.start_time && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatBattleDate(battle.start_time)}
          </span>
        )}
      </div>
    </div>
  );
}

export function BattleTabs({
  activeTab,
  onChange,
  completed,
  leaderboardCount,
}: {
  activeTab: 'battle' | 'leaderboard';
  onChange: (tab: 'battle' | 'leaderboard') => void;
  completed: boolean;
  leaderboardCount: number;
}) {
  const battleLabel = completed ? 'Results' : 'Battle';
  return (
    <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
      {(['battle', 'leaderboard'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {tab === 'battle' ? battleLabel : 'Leaderboard'}
          {tab === 'leaderboard' && leaderboardCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {leaderboardCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
