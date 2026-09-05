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

import {
  formatPercent,
  normalizeBattleStatistics,
  winRateSummary,
  type BattleOutcome,
  type BattleStatistics,
  type RawBattleStatistics,
} from './normalize';

const OUTCOME_BADGE: Record<
  BattleOutcome,
  { label: string; className: string }
> = {
  win: { label: 'Win', className: 'bg-success/15 text-success' },
  loss: { label: 'Loss', className: 'bg-red/15 text-red' },
  draw: { label: 'Draw', className: 'bg-muted text-muted-foreground' },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
  },
  ongoing: { label: 'Ongoing', className: 'bg-blue/15 text-blue' },
};

export default function StatisticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<BattleStatistics | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('all-time');

  const [getStatistics] = useAxiosGet<RawBattleStatistics>(
    '/battles/statistics/me',
  );

  useEffect(() => {
    const fetchStatistics = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await getStatistics({ params: { timeframe } });
        if (response.success && response.data?.stats) {
          // One payload, one reader — see ./normalize.ts for why the page no
          // longer picks fields out of the response here.
          setStatistics(normalizeBattleStatistics(response.data));
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

  const winRate = winRateSummary(statistics);

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

            <Button
              variant="outline"
              size="icon"
              disabled
              title="Export coming soon"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            testId="stat-card-win-rate"
            title="Win Rate"
            value={winRate.value}
            description={winRate.description}
            icon={<Trophy className="h-5 w-5 text-primary" />}
          />

          <StatCard
            testId="stat-card-accuracy"
            title="Accuracy"
            value={formatPercent(statistics.accuracyPercent)}
            description={`${statistics.correctAnswers} of ${statistics.questionsAnswered} questions`}
            icon={<Target className="h-5 w-5 text-primary" />}
          />

          <StatCard
            testId="stat-card-average-score"
            title="Average Score"
            value={statistics.averageScore.toString()}
            description={`${statistics.totalPoints} total points earned`}
            icon={<Award className="h-5 w-5 text-primary" />}
          />

          <StatCard
            testId="stat-card-response-time"
            title="Response Time"
            value={`${statistics.averageTimeSeconds}s`}
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
                Your average score and win rate, week by week
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
                        dataKey="winRatePercent"
                        stroke="hsl(var(--secondary-foreground))"
                        strokeWidth={2}
                        dot={false}
                        name="Win rate %"
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
                {statistics.performanceByTopic.map((topic) => (
                  <div key={topic.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{topic.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatPercent(topic.winRatePercent)} won ·{' '}
                        {topic.battles} battles
                      </span>
                    </div>
                    <Progress
                      value={topic.winRatePercent ?? 0}
                      className="h-2"
                      aria-label={`${topic.label} win rate`}
                    />
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
                {statistics.recentBattles.map((battle) => (
                  <div
                    key={battle.id}
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
                        {battle.rank !== null && (
                          // The payload has no participant count, so this
                          // used to render "Rank 2/0".
                          <div className="text-sm text-muted-foreground">
                            Rank {battle.rank}
                          </div>
                        )}
                      </div>
                      <Badge
                        className={OUTCOME_BADGE[battle.outcome].className}
                      >
                        {OUTCOME_BADGE[battle.outcome].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/battle-zone/my')}
              >
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
                {statistics.topTopics.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No topic data yet — complete some battles first.
                  </p>
                )}
                {statistics.topTopics.map((topic, index) => (
                  <div
                    key={topic.label}
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
                      <div className="font-medium">{topic.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {topic.battles} battles
                      </div>
                    </div>
                    <div className="text-right font-bold">
                      {topic.averageScore} pts avg
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/battle-zone')}
              >
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
              {statistics.performanceByDifficulty.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground sm:col-span-3">
                  No completed battles yet.
                </p>
              )}
              {statistics.performanceByDifficulty.map((difficulty) => (
                <div
                  key={difficulty.label}
                  className="rounded-lg border p-6 text-center"
                >
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                      difficulty.label === 'Easy'
                        ? 'bg-success/15 text-success'
                        : difficulty.label === 'Medium'
                          ? 'bg-warning/15 text-warning'
                          : 'bg-red/15 text-red'
                    }`}
                  >
                    {difficulty.label === 'Easy' ? (
                      <Zap className="h-8 w-8" />
                    ) : difficulty.label === 'Medium' ? (
                      <Swords className="h-8 w-8" />
                    ) : (
                      <Brain className="h-8 w-8" />
                    )}
                  </div>
                  <h3 className="mb-1 text-xl font-bold">{difficulty.label}</h3>
                  <p
                    className="mb-4 text-muted-foreground"
                    data-testid="difficulty-battles"
                  >
                    {difficulty.battles} battles
                  </p>
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">
                      {formatPercent(difficulty.winRatePercent)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Win rate ({difficulty.wins} won)
                  </p>
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
  testId?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

function StatCard({
  title,
  value,
  description,
  icon,
  testId,
  trend,
}: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid="stat-card-value">
          {value}
        </div>
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
