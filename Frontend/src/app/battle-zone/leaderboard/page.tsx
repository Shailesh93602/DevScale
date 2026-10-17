'use client';

import { useState, useEffect } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Search,
  Trophy,
  Medal,
  Award,
  Users,
  BarChart,
  CheckCircle,
} from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import type { RatingLeaderboardEntry } from '@/components/Landing/SimpleWeeklyLeaderboard';
import {
  toLeaderboardEntries,
  type LeaderboardEntry,
} from '@/lib/rating-leaderboard';

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [getLeaderboard] = useAxiosGet<RatingLeaderboardEntry[]>(
    '/ratings/leaderboard',
  );

  useEffect(() => {
    let cancelled = false;
    void getLeaderboard({ params: { limit: 100 } }).then((response) => {
      if (cancelled) return;
      setLoadFailed(!response.success);
      setLeaderboard(
        response.success ? toLeaderboardEntries(response.data) : [],
      );
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [getLeaderboard]);

  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const averageRating = leaderboard.length
    ? leaderboard.reduce((sum, entry) => sum + entry.score, 0) /
      leaderboard.length
    : 0;

  const stats = [
    {
      label: 'Rated Players',
      value: leaderboard.length.toLocaleString(),
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Total Wins',
      value: leaderboard
        .reduce((sum, entry) => sum + entry.battles_won, 0)
        .toLocaleString(),
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Avg. Rating',
      value: averageRating.toFixed(0),
      icon: <BarChart className="h-5 w-5 text-primary" />,
    },
  ];

  // Render loading state
  if (isLoading) {
    return (
      <BattleZoneLayout>
        <div className="animate-pulse space-y-8">
          <div className="space-y-2">
            <div className="h-10 w-48 rounded bg-muted" />
            <div className="h-4 w-64 rounded bg-muted" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['stat-1', 'stat-2', 'stat-3', 'stat-4'].map((id) => (
              <div key={id} className="rounded-xl border bg-card p-6">
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-5 w-5 rounded bg-muted" />
                </div>
                <div className="mt-4 h-8 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="h-10 w-40 rounded bg-muted" />
              <div className="h-10 w-40 rounded bg-muted" />
            </div>
            <div className="h-10 w-64 rounded bg-muted" />
          </div>

          <div className="space-y-4">
            <div className="h-10 w-full rounded bg-muted" />
            {['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6'].map(
              (id) => (
                <div
                  key={id}
                  className="flex items-center rounded-lg border p-4"
                >
                  <div className="mr-6 h-8 w-8 rounded-full bg-muted" />
                  <div className="flex flex-1 items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="mx-2 hidden h-6 w-24 rounded bg-muted sm:block" />
                  <div className="mx-2 hidden h-6 w-24 rounded bg-muted sm:block" />
                  <div className="mx-2 hidden h-6 w-24 rounded bg-muted sm:block" />
                  <div className="ml-2 h-6 w-32 rounded bg-muted" />
                </div>
              ),
            )}
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            See who&apos;s leading the battle zone rankings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            aria-label="Search players"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loadFailed ? (
          <div role="alert" className="py-12 text-center">
            <h2 className="mb-2 text-xl font-bold">
              The leaderboard could not be loaded
            </h2>
            <p className="text-muted-foreground">Please refresh the page.</p>
          </div>
        ) : (
          <LeaderboardTable entries={filteredLeaderboard} />
        )}
      </div>
    </BattleZoneLayout>
  );
}

// Leaderboard Table Component
function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-bold">No Results Found</h2>
        <p className="text-muted-foreground">
          Try adjusting your search or filters to see more results.
        </p>
      </div>
    );
  }

  // Highlight top 3 with special styling
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="bg-yellow-500 flex h-8 w-8 items-center justify-center rounded-full text-white">
          <Trophy className="h-4 w-4" />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-white">
          <Medal className="h-4 w-4" />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-white">
          <Award className="h-4 w-4" />
        </div>
      );
    } else {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {rank}
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="hidden items-center rounded-lg border bg-muted p-4 font-medium sm:flex">
        <div className="w-12 text-center">#</div>
        <div className="flex-1">User</div>
        <div className="w-24 text-center">Rating</div>
        <div className="w-24 text-center">Wins</div>
        <div className="w-24 text-center">Win Rate</div>
      </div>

      {/* Table Rows */}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex flex-wrap items-center rounded-lg border p-4 ${
            entry.rank <= 3 ? 'border-primary/20 bg-primary/5' : ''
          }`}
        >
          <div className="mb-2 flex w-full items-center justify-between sm:mb-0 sm:w-auto">
            <div className="flex items-center gap-3 sm:w-12 sm:justify-center">
              {renderRankBadge(entry.rank)}
            </div>

            <div className="flex flex-1 items-center gap-3 sm:w-auto">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {entry.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{entry.username}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.battles_participated} battles
                </div>
              </div>
            </div>

            <div className="font-bold sm:hidden">{entry.score}</div>
          </div>

          <div className="hidden w-24 justify-center text-center font-bold sm:flex">
            {entry.score}
          </div>

          <div className="hidden w-24 justify-center text-center sm:flex">
            {entry.battles_won}
          </div>

          <div className="hidden w-24 justify-center text-center sm:flex">
            {entry.win_rate}%
          </div>
        </div>
      ))}
    </div>
  );
}
