'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BattleZoneLayout from '@/components/Battle/BattleZoneLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart as LineChartIcon,
  Trophy,
  Clock,
  Award,
  Download,
  Swords,
  Brain,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  AlertCircle,
} from 'lucide-react';
import { useAxiosGet } from '@/hooks/useAxios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Raw shape returned by the backend (snake_case)
interface RawStatsResponse {
  total_battles?: number; totalBattles?: number;
  wins?: number; battlesWon?: number;
  completed_battles?: number;
  win_rate?: number; winRate?: number;
  total_score?: number; totalPoints?: number;
  averageScore?: number;
  questions_answered?: number; questionsAnswered?: number;
  correct_answers?: number; correctAnswers?: number;
  accuracy?: number;
  avg_time_ms?: number; averageTime?: number;
  top_topics?: RawTopic[]; topTopics?: RawTopic[];
  recent_battles?: RawBattle[]; recentBattles?: RawBattle[];
  performance_by_difficulty?: RawDifficulty[]; performanceByDifficulty?: RawDifficulty[];
  performance_by_topic?: RawTopic[]; performanceByTopic?: RawTopic[];
  performance_over_time?: RawWeek[]; performanceOverTime?: RawWeek[];
}
interface RawTopic { topic?: string; name?: string; avg_score?: number; score?: number; battles?: number; win_rate?: number; accuracy?: number; }
interface RawBattle { id: string; title?: string; ended_at?: string; date?: string; result?: string; score?: number; rank?: number; totalParticipants?: number; }
interface RawDifficulty { difficulty?: string; win_rate?: number; accuracy?: number; battles?: number; }
interface RawWeek { week?: string; date?: string; avg_score?: number; score?: number; wins?: number; battles?: number; accuracy?: number; }

interface StatisticsData {
  totalBattles: number;
  battlesWon: number;
  battlesLost: number;
  winRate: number;
  totalPoints: number;
  averageScore: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  topTopics: {
    topic: string;
    score: number;
    battles: number;
  }[];
  recentBattles: {
    id: string;
    title: string;
    date: string;
    result: 'win' | 'loss' | 'ongoing';
    score: number;
    rank: number;
    totalParticipants: number;
  }[];
  performanceByDifficulty: {
    difficulty: string;
    accuracy: number;
    battles: number;
  }[];
  performanceByTopic: {
    topic: string;
    accuracy: number;
    battles: number;
  }[];
  performanceOverTime: {
    date: string;
    score: number;
    accuracy: number;
  }[];
}

export default function StatisticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('all-time');

  const [getStatistics] = useAxiosGet<StatisticsData>('/battles/statistics/me');

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await getStatistics({ params: { timeframe } });
        if (response.success && response.data) {
          // Normalize snake_case API response → camelCase StatisticsData
          const d = response.data as unknown as RawStatsResponse;
          const normalized: StatisticsData = {
            totalBattles: d.total_battles ?? d.totalBattles ?? 0,
            battlesWon: d.wins ?? d.battlesWon ?? 0,
            battlesLost: (d.completed_battles ?? 0) - (d.wins ?? 0),
            winRate: d.win_rate ?? d.winRate ?? 0,
            totalPoints: d.total_score ?? d.totalPoints ?? 0,
            averageScore: (d.completed_battles ?? 0) > 0
              ? Math.round((d.total_score ?? 0) / (d.completed_battles ?? 1))
              : (d.averageScore ?? 0),
            questionsAnswered: d.questions_answered ?? d.questionsAnswered ?? 0,
            correctAnswers: d.correct_answers ?? d.correctAnswers ?? 0,
            accuracy: d.accuracy ?? 0,
            averageTime: d.avg_time_ms != null
              ? Math.round(d.avg_time_ms / 1000)
              : (d.averageTime ?? 0),
            topTopics: (d.top_topics ?? d.topTopics ?? []).map((t: any) => ({
              topic: t.topic ?? t.name ?? '',
              score: t.avg_score ?? t.score ?? 0,
              battles: t.battles ?? 0,
            })),
            recentBattles: (d.recent_battles ?? d.recentBattles ?? []).map((b: any) => ({
              id: b.id,
              title: b.title ?? 'Battle',
              date: b.ended_at ? new Date(b.ended_at).toLocaleDateString() : (b.date ?? ''),
              result: b.result === 'won' ? 'win' : b.result === 'lost' ? 'loss' : (b.result ?? 'ongoing'),
              score: b.score ?? 0,
              rank: b.rank ?? 0,
              totalParticipants: b.totalParticipants ?? 0,
            })),
            performanceByDifficulty: (d.performance_by_difficulty ?? d.performanceByDifficulty ?? []).map((x: any) => ({
              difficulty: x.difficulty
                ? x.difficulty.charAt(0).toUpperCase() + x.difficulty.slice(1).toLowerCase()
                : '',
              accuracy: x.win_rate ?? x.accuracy ?? 0,
              battles: x.battles ?? 0,
            })),
            performanceByTopic: (d.performance_by_topic ?? d.performanceByTopic ?? []).map((x: any) => ({
              topic: x.topic ?? '',
              accuracy: x.win_rate ?? x.accuracy ?? 0,
              battles: x.battles ?? 0,
            })),
            performanceOverTime: (d.performance_over_time ?? d.performanceOverTime ?? []).map((x: any) => ({
              date: x.week ?? x.date ?? '',
              score: x.avg_score ?? x.score ?? 0,
              accuracy: x.wins != null && x.battles > 0
                ? Math.round((x.wins / x.battles) * 100)
                : (x.accuracy ?? 0),
            })),
          };
          setStatistics(normalized);
        } else {
          setStatistics(null);
          setErrorMessage(response.message || 'Unable to load statistics.');
        }
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        setStatistics(null);
        setErrorMessage('Failed to fetch statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [timeframe]);

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
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px]" />
            <Skeleton className="h-[300px]" />
          </div>
        </div>
      </BattleZoneLayout>
    );
  }

  if (errorMessage || !statistics) {
    return (
      <BattleZoneLayout>
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
          <h2 className="text-xl font-semibold">Statistics unavailable</h2>
          <p className="mt-2 text-muted-foreground">
            {errorMessage || 'No statistics available yet.'}
          </p>
        </div>
      </BattleZoneLayout>
    );
  }

  return (
    <BattleZoneLayout>
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Battle Statistics</h1>
            <p className="text-muted-foreground">
              Track your performance and progress in battles
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" disabled title="Export coming soon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Win Rate"
            value={`${statistics.winRate}%`}
            description={`${statistics.battlesWon} of ${statistics.totalBattles} battles`}
            icon={<Trophy className="h-5 w-5 text-primary" />}
          />

          <StatCard
            title="Accuracy"
            value={`${statistics.accuracy}%`}
            description={`${statistics.correctAnswers} of ${statistics.questionsAnswered} questions`}
            icon={<Target className="h-5 w-5 text-primary" />}
          />

          <StatCard
            title="Average Score"
            value={statistics.averageScore.toString()}
            description={`${statistics.totalPoints} total points earned`}
            icon={<Award className="h-5 w-5 text-primary" />}
          />

          <StatCard
            title="Response Time"
            value={`${statistics.averageTime}s`}
            description="Average time per question"
            icon={<Clock className="h-5 w-5 text-primary" />}
          />
        </div>

        {/* Performance Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Your battle scores and accuracy trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full sm:h-[300px]">
                {statistics.performanceOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={statistics.performanceOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        name="Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="hsl(var(--secondary-foreground))"
                        strokeWidth={2}
                        dot={false}
                        name="Accuracy"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center text-center">
                      <LineChartIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No performance data available yet
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>Your strengths and weaknesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.performanceByTopic.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No topic data yet — complete some battles first.
                  </p>
                )}
                {statistics.performanceByTopic.map((topic, index) => (
                  <div key={index}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{topic.topic}</span>
                      <span className="text-sm text-muted-foreground">
                        {topic.accuracy}%
                      </span>
                    </div>
                    <Progress value={topic.accuracy} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Battles and Top Topics */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Battles</CardTitle>
              <CardDescription>Your latest battle performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.recentBattles.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No battles yet. Join your first battle to see history here!
                  </p>
                )}
                {statistics.recentBattles.map((battle, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <div className="font-medium">{battle.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {battle.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{battle.score} pts</div>
                        <div className="text-sm text-muted-foreground">
                          Rank {battle.rank}/{battle.totalParticipants}
                        </div>
                      </div>
                      <Badge
                        className={
                          battle.result === 'win'
                            ? 'bg-green-500/15 text-green-700'
                            : battle.result === 'loss'
                              ? 'bg-red-500/15 text-red-700'
                              : 'bg-blue-500/15 text-blue-700'
                        }
                      >
                        {battle.result === 'win'
                          ? 'Win'
                          : battle.result === 'loss'
                            ? 'Loss'
                            : 'Ongoing'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/battle-zone/my')}>
                View All Battles
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Topics</CardTitle>
              <CardDescription>Your best performing topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.topTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full text-primary">
                      {index === 0 ? (
                        <Trophy className="h-5 w-5" />
                      ) : index === 1 ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        <Brain className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{topic.topic}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.battles} battles
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      {topic.score} pts
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push('/battle-zone')}>
                Browse All Battles
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Performance by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Difficulty</CardTitle>
            <CardDescription>
              How you perform across different difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              {statistics.performanceByDifficulty.map((difficulty, index) => (
                <div key={index} className="rounded-lg border p-6 text-center">
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      difficulty.difficulty === 'Easy'
                        ? 'bg-green-500/15 text-green-700'
                        : difficulty.difficulty === 'Medium'
                          ? 'bg-yellow-500/15 text-yellow-700'
                          : 'bg-red-500/15 text-red-700'
                    }`}
                  >
                    {difficulty.difficulty === 'Easy' ? (
                      <Zap className="h-8 w-8" />
                    ) : difficulty.difficulty === 'Medium' ? (
                      <Swords className="h-8 w-8" />
                    ) : (
                      <Brain className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="mb-1 text-xl font-bold">
                    {difficulty.difficulty}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {difficulty.battles} battles
                  </p>
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {difficulty.accuracy}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Accuracy rate</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </BattleZoneLayout>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div
            className={`mt-2 flex items-center text-xs ${
              trend.direction === 'up' ? 'text-green' : 'text-red'
            }`}
          >
            {trend.direction === 'up' ? (
              <ArrowUpRight className="mr-1 h-3 w-3" />
            ) : (
              <ArrowDownRight className="mr-1 h-3 w-3" />
            )}
            <span>{trend.value}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
