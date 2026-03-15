'use client';

import { useState, useEffect } from 'react';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Trophy, Medal, Award, Users, BarChart } from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  rank: number;
  score: number;
  battles_won: number;
  battles_participated: number;
  win_rate: number;
  badges: string[];
  last_active: string;
}

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('overall');

  const [getLeaderboard] = useAxiosGet<LeaderboardEntry[]>('/api/leaderboard');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would pass the timeframe and category as query params
        const response = await getLeaderboard();
        if (response.data) {
          setLeaderboard(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, category]);

  // Filter leaderboard by search term
  const filteredLeaderboard = leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Mock data for stats
  const stats = [
    {
      label: 'Total Battles',
      value: '1,248',
      icon: <Swords className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Active Users',
      value: '842',
      icon: <Users className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Questions Answered',
      value: '24,680',
      icon: <CheckCircle className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Avg. Score',
      value: '76.4',
      icon: <BarChart className="h-5 w-5 text-primary" />,
    },
  ];

  // Render loading state
  if (isLoading) {
    return (
      <BattleZoneLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[100px]" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[80px]" />
            ))}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
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

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="wins">Most Wins</SelectItem>
                <SelectItem value="participation">Most Active</SelectItem>
                <SelectItem value="win-rate">Best Win Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global">
          <TabsList className="w-full">
            <TabsTrigger value="global" className="flex-1">
              Global
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1">
              Friends
            </TabsTrigger>
            <TabsTrigger value="topic" className="flex-1">
              By Topic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global" className="mt-6">
            <LeaderboardTable entries={filteredLeaderboard} />
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <LeaderboardTable entries={filteredLeaderboard.slice(0, 5)} />
          </TabsContent>

          <TabsContent value="topic" className="mt-6">
            <div className="mb-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <LeaderboardTable entries={filteredLeaderboard.slice(2, 8)} />
          </TabsContent>
        </Tabs>
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
        <div className="w-24 text-center">Score</div>
        <div className="w-24 text-center">Wins</div>
        <div className="w-24 text-center">Win Rate</div>
        <div className="w-32 text-center">Badges</div>
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
                <AvatarImage src={entry.avatar_url} alt={entry.username} />
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

            <div className="font-bold sm:hidden">{entry.score} pts</div>
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

          <div className="mt-2 flex w-full flex-wrap gap-2 sm:mt-0 sm:w-32 sm:justify-center">
            {entry.badges.map((badge, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Missing component definition
function Swords(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" x2="19" y1="19" y2="13" />
      <polyline points="9.5 6.5 21 18 21 21 18 21 6.5 9.5" />
      <line x1="5" x2="11" y1="11" y2="5" />
    </svg>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
